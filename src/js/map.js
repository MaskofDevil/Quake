// Get Mapbox Access Token
import TOKEN from '../../config.js'

mapboxgl.accessToken = TOKEN;

// Initialize mapbox object
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v8',
    zoom: 1,
    attributionControl: false
})

// disable map rotation using right click + drag
map.dragRotate.disable()

// disable map rotation using touch rotation gesture
map.touchZoomRotate.disableRotation()

// Global variables
let isFullyLoaded = false
let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
let label_text = 'Earthquakes of Past 30 days'
let date1, date2, min, max

// Initialize mapbox popup
const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
})

// Function to add popup for earthquakes, global seismic network & volcanoes info
function addPopup(source, showTimeAgo) {

    map.on('mouseenter', source, (e) => {
        map.getCanvas().style.cursor = 'pointer'

        let coordinates = e.features[0].geometry.coordinates.slice()
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        // For each earthquakes show magnitude, place and time
        // REVIEW - show depth also
        if (source === 'earthquakes') {
            let mag = e.features[0].properties.mag ? e.features[0].properties.mag.toFixed(1) : ''
            let place = e.features[0].properties.place ? e.features[0].properties.place : ''
            let time = e.features[0].properties.time ? new Date(e.features[0].properties.time) : ''

            if (showTimeAgo) {
                popup.setLngLat(coordinates).setHTML(
                    `<div class="popup">
                        <span class="popup-head">${mag}</span>
                        <span class="popup-text">
                            ${place}
                            <br>
                            <strong>(${moment(time).fromNow()})</strong>
                        </span>
                    </div>`
                ).addTo(map)
            } else {
                popup.setLngLat(coordinates).setHTML(
                    `<div class="popup">
                        <span class="popup-head">${mag}</span>
                        <span class="popup-text">
                            ${place}
                            <br>
                            <strong>${moment(time).format('dddd LT')}</strong>
                            <strong>${moment(time).format('DD/MM/YYYY')}</strong>
                        </span>
                    </div>`
                ).addTo(map)
            }
        }
        else if (source === 'Global Seismic Network') {
            let name = e.features[0].properties.name ? e.features[0].properties.name : ''
            let host = e.features[0].properties.host ? e.features[0].properties.host : ''

            popup.setLngLat(coordinates).setHTML(
                `<div class="popup">
                    <span class="popup-text">
                        ${name}
                        <br>
                        <strong>${host}</strong>
                    </span>
                </div>`
            ).addTo(map)
        }
        else if (source === 'Volcanoes') {
            let name = e.features[0].properties.V_Name ? e.features[0].properties.V_Name : ''

            popup.setLngLat(coordinates).setHTML(
                `<div class="popup">
                    <span class="popup-head">
                        <svg width="10" height="10" viewBox="0 0 48 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M46 49.5H2V47.5C9.6 43.5 15.8333 34.1667 18 30H31C33.4 36 42 44.1667 46 47.5V49.5Z" stroke="black" stroke-width="3.5"/>
                            <path d="M10.5 10.5C11.5 6.73431 15 6.73431 15 6.73431C16.5873 6.73431 15.1 3.69999 19.5 2.49999C23.9 1.29998 25.9128 4.7343 25.9128 6.73431C26.2462 5.90098 27.8128 4.13432 31.4128 3.73432C35.0128 3.33432 36.5795 7 36.9128 8.5C38.9128 8.33333 43.1128 8.53432 43.9128 13.7343C44.7128 18.9343 39.5795 20.2343 36.9128 20.2343C32.1128 25.4343 28.2462 21.401 26.9128 18.7343C23.7128 22.3343 21.3334 21 20.0001 19.5C18.4001 22.3 13.5001 21.1666 12.5001 20C9.70006 20 8 17.5 8.50004 15.5C7.30004 12.7 9.50004 11.1666 10.5 10.5Z" stroke="black" stroke-width="3" stroke-linejoin="round"/>
                            <path d="M21 32V43H23V32H27V41H29V32H21Z" stroke="black" stroke-width="2" stroke-linejoin="round"/>
                        </svg>
                    </span>
                    <span class="popup-text">${name}</span>
                </div>`
            ).addTo(map)
        }
    })

    map.on('mouseleave', source, () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
    })
}

// Function to add earthquakes in map
function addEarthquakes(geojson, showTimeAgo) {

    if (!showTimeAgo) {
        // Change label text in the menu
        label_text = `${date1.format('DD/MM/YYYY')} to ${date2.format('DD/MM/YYYY')}`
        if (min && max) {
            label_text += ` (M ${parseFloat(min).toFixed(1)}-${parseFloat(max).toFixed(1)})`
        } else if (min) {
            label_text += ` (M >=${parseFloat(min).toFixed(1)})`
        } else if (max) {
            label_text += ` (M <=${parseFloat(max).toFixed(1)})`
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

    // Add popup for earthquakes
    addPopup('earthquakes', showTimeAgo)
}

// Function to remove earthquakes in map
function removeEarthquakes() {
    if (map.isSourceLoaded('earthquakes') && map.getLayer('earthquakes')) {
        map.removeLayer('earthquakes')
        map.removeSource('earthquakes')
    }
}

// Load tilesets(tectonic plates, Global Seismic Network, Orogens & Volcanoes) on map load
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

    // Load Global Seismic Station Network Stations of type circle
    map.addSource('stations', {
        type: 'vector',
        url: 'mapbox://vormir.2yxd9iqp'
    })
    map.addLayer({
        id: 'Global Seismic Network',
        type: 'circle',
        source: 'stations',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'circle-color': '#61FF00',
            'circle-radius': 2,
            'circle-stroke-color': '#3DA000',
            'circle-stroke-width': 1
        },
        'source-layer': 'Global_Seismic_Network-bmzsty'
    })

    // Add popup for global seismic network stations
    addPopup('Global Seismic Network')

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

    // Add popup for volcanoes
    addPopup('Volcanoes')

    // Add earthquakes
    addEarthquakes(url, true)
})

// Toggle tilesets on/off in map idle state
map.on('idle', () => {

    // Check if all tilesets are loaded or not
    if (!map.getLayer('Tectonic Plates') || !map.getLayer('Orogens') || !map.getLayer('Global Seismic Network') || !map.getLayer('Volcanoes')) {
        return
    }

    const toggleableLayerIds = ['Tectonic Plates', 'Orogens', 'Global Seismic Network', 'Volcanoes']

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

        input.addEventListener('click', () => {
            let clickedLayer = label.textContent

            let visibility = map.getLayoutProperty(clickedLayer, 'visibility')

            if (visibility === 'visible') {
                map.setLayoutProperty(clickedLayer, 'visibility', 'none')
            } else {
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible')
            }
        })

        label.addEventListener('click', (e) => {
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

        // REVIEW
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