mapboxgl.accessToken = 'pk.eyJ1Ijoidm9ybWlyIiwiYSI6ImNrem81OGVtZTBhaWQydnFtdnZ1cGh2NnUifQ.nUvum4Lnw_0dQp60KQiWXQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/vormir/ckzo5g2rg002l15r0jsz86gsz',
    center: [-122.44121, 37.76132],
    zoom: 1
})

const mag = document.getElementById('mag')
const loc = document.getElementById('loc')
const date = document.getElementById('date')

map.on('load', () => {
    map.addSource('earthquakes', {
        type: 'geojson',
        data: 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventtype=earthquake',
        generateId: true
    })
    map.addLayer({
        id: 'earthquakes-viz',
        type: 'circle',
        source: 'earthquakes',
        paint: {
            'circle-radius': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                [
                    'interpolate',
                    ['linear'],
                    ['get', 'mag'], 1, 7, 2, 9, 3, 11, 4, 13, 5, 15, 6, 17, 7, 19
                ],
                [
                    'interpolate',
                    ['linear'],
                    ['get', 'mag'], 1, 1, 1.5, 1.5, 2, 2, 2.5, 2.5, 3, 3, 3.5, 3.5, 4.5, 4.5, 5, 5
                ]
            ],
            'circle-opacity': 0.9,
            'circle-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                [
                    'interpolate',
                    ['linear'],
                    ['get', 'mag'], 1, '#f1b36f', 2, '#f0ae64', 3, '#f0a95a', 4, '#f19f4c', 5, '#f58b3b', 6, '#f97a2c', 7, '#fc691d'
                ],
                '#fc691d'
            ]
        }
    })
})

let quakeID = null

map.on('mousemove', 'earthquakes-viz', (event) => {
    map.getCanvas().style.cursor = 'pointer'

    const quakeMagnitude = event.features[0].properties.mag
    const quakeLocation = event.features[0].properties.place
    const quakeDate = new Date(event.features[0].properties.time)

    if (event.features.length === 0) return

    mag.textContent = quakeMagnitude
    loc.textContent = quakeLocation
    date.textContent = quakeDate

    if (quakeID) {
        map.removeFeatureState({
            source: 'earthquakes',
            id: quakeID
        })
    }

    quakeID = event.features[0].id

    map.setFeatureState(
        {
            source: 'earthquakes',
            id: quakeID
        },
        {
            hover: true
        }
    )
})

map.on('mouseleave', 'earthquakes-viz', () => {
    if (quakeID) {
        map.setFeatureState(
            {
                source: 'earthquakes',
                id: quakeID
            },
            {
                hover: false
            }
        )
    }

    quakeID = null

    mag.textContent = ''
    loc.textContent = ''
    date.textContent = ''

    map.getCanvas().style.cursor = ''
})