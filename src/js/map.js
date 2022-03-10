import TOKEN from '../../config.js'

mapboxgl.accessToken = TOKEN;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/vormir/ckzo5g2rg002l15r0jsz86gsz',
    zoom: 1
})

// let url_duration = [ 'all_hour', 'all_day', 'all_week', 'all_month' ]

function addEarthquakes(url) {
    // NOTE - Earthquakes until past month
    map.addSource('earthquakes', {
        type: 'geojson',
        data: url
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
        let mag = e.features[0].properties.mag
        let place = e.features[0].properties.place
        let time = new Date(e.features[0].properties.time)

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        popup.setLngLat(coordinates).setHTML(`<div class="popup"><h2 class="popup-mag">${mag.toFixed(1)}</h2><span class="popup-text">${place}<br><strong>(${moment(time).fromNow()})</strong></span></div>`).addTo(map)
    })

    map.on('mouseleave', 'earthquakes', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
    })
}

map.on('load', () => {
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

    // NOTE - Global Seismic Station Network Stations
    // REVIEW - Show station name
    map.loadImage('./src/assets/station.png', (error, image) => {
        if (error) throw error

        map.addImage('s', image)

        map.addSource('stations', {
            type: 'vector',
            url: 'mapbox://vormir.5sfg2jsk'
        })

        map.addLayer({
            id: 'GSN Stations',
            type: 'symbol',
            source: 'stations',
            layout: {
                'icon-image': 's',
                'icon-size': 0.6,
                'visibility': 'none'
            },
            'source-layer': 'Global_Stations-biqr7b'
        })
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
                'icon-size': 0.6,
                'visibility': 'none'
            },
            'source-layer': 'volcanoes-8tw6ca'
        })
    })

    addEarthquakes('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')

    // Remove loading screen after Map loaded
    document.querySelector('.overlay').parentNode.removeChild(document.querySelector('.overlay'))
})

map.on('idle', () => {
    if (!map.getLayer('Tectonic Plates') || !map.getLayer('GSN Stations') || !map.getLayer('Orogens') || !map.getLayer('Volcanoes')) {
        return
    }

    // REVIEW - Modify textContent of the label for tectonic-plates and orogens[capitalize 1st letter & replace - with space]
    const toggleableLayerIds = ['Tectonic Plates', 'GSN Stations', 'Orogens', 'Volcanoes']

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