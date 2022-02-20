mapboxgl.accessToken = 'pk.eyJ1Ijoidm9ybWlyIiwiYSI6ImNrem81OGVtZTBhaWQydnFtdnZ1cGh2NnUifQ.nUvum4Lnw_0dQp60KQiWXQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v11',
    center: [-122.44121, 37.76132],
    zoom: 3.5
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
                    ['get', 'mag'], 1, 8, 1.5, 10, 2, 12, 2.5, 14, 3, 16, 3.5, 18, 4.5, 20, 6.5, 22, 8.5, 24, 10.5, 26
                ],
                [
                    'interpolate',
                    ['linear'],
                    ['get', 'mag'], 1, 1, 1.5, 1.5, 2, 2, 2.5, 2.5, 3, 3, 3.5, 3.5, 4.5, 4.5, 5, 5
                ]
            ],
            'circle-opacity': 0.5,
            'circle-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                [
                    'interpolate',
                    ['linear'],
                    ['get', 'mag'], 1, '#fff7ec', 1.5, '#fee8c8', 2, '#fdd49e', 2.5, '#fdbb84', 3, '#fc8d59', 3.5, '#ef6548', 4.5, '#d7301f', 6.5, '#b30000', 8.5, '#7f0000', 10.5, '#000'
                ],
                '#000'
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