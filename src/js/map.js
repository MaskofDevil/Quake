import TOKEN from '../../config.js'

mapboxgl.accessToken = TOKEN;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/vormir/ckzo5g2rg002l15r0jsz86gsz',
    zoom: 1
})

map.on('load', () => {

    // REVIEW - Theme/Style toggle
    // const style = map.getStyle()
    // console.log(style.sprite)

    // document.getElementById('theme-toggle').addEventListener('click', () => {
    //     map.setStyle("mapbox://styles/mapbox/streets-v11")
    // })

    // NOTE - Tectonic Plates
    map.addSource('tectonic-plates', {
        type: 'vector',
        url: 'mapbox://vormir.9teewsr6'
    })
    map.addLayer({
        id: 'Tectonic Plates',
        type: 'line',
        source: 'tectonic-plates',
        layout: {
            'visibility': 'none',
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#ff8647',
            'line-opacity': 0.8,
            'line-width': 1.5
        },
        'source-layer': 'PB2002_boundaries-34gn86'
    })

    // NOTE - Orogens
    map.addSource('orogens', {
        type: 'vector',
        url: 'mapbox://vormir.3f7w5oo2'
    })
    map.addLayer({
        id: 'Orogens',
        type: 'fill',
        source: 'orogens',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'fill-color': '#bf5017',
            'fill-opacity': 0.6
        },
        'source-layer': 'PB2002_orogens-475qdc'
    })

    // NOTE - Volcanoes
    map.loadImage('./src/assets/volcano.png', (error, image) => {
        if (error) throw error

        map.addImage('v', image)

        map.addSource('volcanoes', {
            type: 'vector',
            url: 'mapbox://vormir.4n5yar0k'
        })

        map.addLayer({
            id: 'Volcanoes',
            type: 'symbol',
            source: 'volcanoes',
            layout: {
                'icon-image': 'v',
                'icon-size': 0.5,
                'visibility': 'none'
            },
            'source-layer': 'volcanoes-8tw6ca'
        })
    })

    // NOTE - Earthquakes until past month
    map.addSource('earthquakes', {
        type: 'geojson',
        data: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
    })
    map.addLayer({
        id: 'earthquakes',
        type: 'circle',
        source: 'earthquakes',
        paint: {
            'circle-blur': 0.5,
            'circle-color': '#fc691d',
            'circle-opacity': 0.6,
            'circle-radius': 5,
            'circle-stroke-color': '#fc691d',
            'circle-stroke-width': 1
        }
    })

    // NOTE - Popup for earthquakes
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    })

    map.on('mouseenter', 'earthquakes', (e) => {
        map.getCanvas().style.cursor = 'pointer'

        let coordinates = e.features[0].geometry.coordinates.slice()
        let title = e.features[0].properties.title
        let time = new Date(e.features[0].properties.time)
        let text = `${title} ${moment(time).fromNow()}`

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        popup.setLngLat(coordinates).setHTML(text).addTo(map)
    })

    map.on('mouseleave', 'earthquakes', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
    })
})

map.on('idle', () => {
    if (!map.getLayer('Tectonic Plates') || !map.getLayer('Orogens') || !map.getLayer('Volcanoes')) {
        return
    }

    // REVIEW - Modify textContent of the label for tectonic-plates and orogens[capitalize 1st letter & replace - with space]
    const toggleableLayerIds = ['Tectonic Plates', 'Orogens', 'Volcanoes']

    for (let id of toggleableLayerIds) {
        if (document.getElementById(id)) {
            continue
        }

        const input = document.createElement('input')
        input.id = id
        input.type = 'checkbox'
        input.checked = false

        const label = document.createElement('label')
        label.for = id
        label.textContent = id

        const div = document.createElement('div')
        div.appendChild(input)
        div.appendChild(label)

        div.addEventListener('click', (e) => {
            let clickedLayer = label.textContent
            e.preventDefault()
            e.stopPropagation()

            let visibility = map.getLayoutProperty(clickedLayer, 'visibility')

            if (visibility === 'visible') {
                map.setLayoutProperty(clickedLayer, 'visibility', 'none')
                input.checked = false
            } else {
                input.checked = true
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible')
            }
        })

        document.querySelector('#full-menu section').appendChild(div)
    }
})