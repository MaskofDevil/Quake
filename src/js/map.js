// Get Mapbox Access Token
import TOKEN from '../../config.js'

mapboxgl.accessToken = TOKEN;

// Initialize mapbox object
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/vormir/ckzo5g2rg002l15r0jsz86gsz',
    zoom: 1
})

// Global variables
let isFullyLoaded = false
let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
let label_text = 'Earthquakes of Past 30 days'
let date1, date2, min, max

// Function to add earthquakes in map
function addEarthquakes(geojson, showTimeAgo) {

    if (!showTimeAgo) {
        // Change label text in the menu
        label_text = `Earthquakes from ${date1.format('DD-MM-YYYY')} to ${date2.format('DD-MM-YYYY')}`
        if (min || max) {
            label_text += ` (M ${min}-${max})`
        }

        // Check for API call error(USGS API query response must be <= 20,000)
        fetch(geojson.replace('/query?', '/count?'))
            .catch(error => console.log(error))
    }

    // Show label_text in the menu
    document.querySelector('#showing-label p').textContent = label_text

    // Add earthquakes source
    map.addSource('earthquakes', {
        type: 'geojson',
        data: geojson
    })

    // Add earthquakes layer of type circle and interpolate circle color, radius w.r.t magnitude
    map.addLayer({
        id: 'earthquakes',
        type: 'circle',
        source: 'earthquakes',
        paint: {
            'circle-blur': 0.3,
            'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'mag'],
                2,
                '#fca31d',
                4,
                '#fc691d',
                6,
                '#fc1d1d'
            ],
            'circle-opacity': 0.5,
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'mag'],
                2,
                4,
                6,
                7,
                10,
                10
            ],
            'circle-stroke-color': [
                'interpolate',
                ['linear'],
                ['get', 'mag'],
                2,
                '#fca31d',
                4,
                '#fc691d',
                6,
                '#fc1d1d'
            ],
            'circle-stroke-width': 1
        }
    })

    // Popup for each earthquakes showing magnitude, place and time
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

        if (showTimeAgo) {
            popup.setLngLat(coordinates).setHTML(`<div class="popup"><h2 class="popup-mag">${mag.toFixed(1)}</h2><span class="popup-text">${place}<br><strong>(${moment(time).fromNow()})</strong></span></div>`).addTo(map)
        } else {
            popup.setLngLat(coordinates).setHTML(`<div class="popup"><h2 class="popup-mag">${mag.toFixed(1)}</h2><span class="popup-text">${place}<br>${moment(time)}</strong></span></div>`).addTo(map)
        }
    })

    map.on('mouseleave', 'earthquakes', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
    })
}

// Function to remove earthquakes in map
function removeEarthquakes() {
    if (map.isSourceLoaded('earthquakes') && map.getLayer('earthquakes')) {
        map.removeLayer('earthquakes')
        map.removeSource('earthquakes')
    }
}

// Load tilesets(tectonic plates, GSN Stations, Orogens & Volcanoes) on map load
map.on('load', () => {

    // Load Tectonic Plates of type line
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

    // Load Global Seismic Station Network Stations of type symbol
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

    // Load Orogens of type fill
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

    // Load Volcanoes of type symbol
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

    // Add earthquakes
    addEarthquakes(url, true)
})

// Toggle tilesets on/off in map idle state
map.on('idle', () => {

    // Check if all tilesets are loaded or not
    if (!map.getLayer('Tectonic Plates') || !map.getLayer('GSN Stations') || !map.getLayer('Orogens') || !map.getLayer('Volcanoes')) {
        return
    }

    const toggleableLayerIds = ['Tectonic Plates', 'GSN Stations', 'Orogens', 'Volcanoes']

    // Toggle visibility of specific tileset
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

    // Remove loading screen after Map fully loaded
    if (!isFullyLoaded) {
        document.querySelector('.overlay').parentNode.removeChild(document.querySelector('.overlay'))
        console.log('Map is Fully Loaded!')
        isFullyLoaded = true
    }
})

// Get earthquakes in specific date and magnitude range in map idle state
map.on('idle', () => {

    // Submitted date and magnitude validation
    document.querySelector('form').addEventListener('submit', (e) => {
        const data = Object.fromEntries(new FormData(e.target).entries())
        e.preventDefault()
        const today = new Date()
        date1 = moment(data.start, 'YYYY-MM-DD')
        date2 = moment(data.end, 'YYYY-MM-DD')
        const range1 = moment('1800-01-01', 'YYYY-MM-DD')
        const range2 = moment(today)
        const isDateValid = (date1.isBetween(range1, range2) || date1.isSame(range1) || date1.isSame(range2)) && (date2.isBetween(range1, range2) || date2.isSame(range1) || date2.isSame(range2)) && (date1.isBefore(date2) && date2.isAfter(date1))

        min = data.min
        max = data.max

        if (data.start && data.end && isDateValid) {
            removeEarthquakes()
            if (data.min && data.max) {
                url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${data.start}&endtime=${data.end}&minmagnitude=${min}&maxmagnitude=${max}`
            } else {
                if (data.min) {
                    url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${data.start}&endtime=${data.end}&minmagnitude=${min}`
                }
                else if (data.max) {
                    url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${data.start}&endtime=${data.end}&maxmagnitude=${max}`
                } else {
                    url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${data.start}&endtime=${data.end}`
                }
            }
            addEarthquakes(url, false)
        } else {
            // REVIEW
            // console.log('Invalid Date')
        }
        document.getElementById('start-date').value = ''
        document.getElementById('end-date').value = ''
        document.getElementById('min-mag').value = ''
        document.getElementById('max-mag').value = ''
    })
})