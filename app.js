mapboxgl.accessToken = 'pk.eyJ1Ijoidm9ybWlyIiwiYSI6ImNrem81OGVtZTBhaWQydnFtdnZ1cGh2NnUifQ.nUvum4Lnw_0dQp60KQiWXQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/vormir/ckzo5g2rg002l15r0jsz86gsz',
    zoom: 1
})

// let api_call = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
// const time = document.getElementById('time').getElementsByTagName('input')

// for (let i = 0; i < time.length; i++) {
//     time[i].onclick = () => {
//         api_call = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/' + time[i].value + '.geojson'
//     }
// }

// const mag = document.getElementById('mag')
// const loc = document.getElementById('loc')
// const date = document.getElementById('date')

map.on('load', () => {

    // REVIEW - Theme/Style toggle
    // const style = map.getStyle()
    // console.log(style.sprite)

    // document.getElementById('theme-toggle').addEventListener('click', () => {
    //     map.setStyle("mapbox://styles/mapbox/streets-v11")
    // })

    // NOTE - Earthquakes grouped by - past hour, past day, past week and past month
    map.addSource('earthquakes-month', {
        type: 'vector',
        url: 'mapbox://vormir.ct3sxzef',
        generateId: true
    })
    map.addLayer({
        id: 'earthquakes-month',
        type: 'circle',
        source: 'earthquakes-month',
        layout: {
            'visibility': 'visible'
        },
        paint: {
            'circle-radius': 5,
            'circle-opacity': 0.9,
            'circle-color': '#fc691d'
        },
        'source-layer': 'all_month-810n6l'
    })

    map.addSource('earthquakes-week', {
        type: 'vector',
        url: 'mapbox://vormir.6p6wjj7v',
        generateId: true
    })
    map.addLayer({
        id: 'earthquakes-week',
        type: 'circle',
        source: 'earthquakes-week',
        layout: {
            'visibility': 'visible'
        },
        paint: {
            'circle-radius': 5,
            'circle-opacity': 0.9,
            'circle-color': '#6deb9c'
        },
        'source-layer': 'all_week-7i42kp'
    })
})

map.on('idle', () => {
    const selection = document.getElementById('selection')

    const toggleLayerIds = ['earthquakes-month', 'earthquakes-week']

    for (let id of toggleLayerIds) {
        // TODO
    }

    selection.addEventListener('click', () => {
        console.log(selection.value)
    })
})

// let quakeID = null

// map.on('mousemove', 'earthquakes-viz', (event) => {
//     map.getCanvas().style.cursor = 'pointer'

//     const quakeMagnitude = event.features[0].properties.mag
//     const quakeLocation = event.features[0].properties.place
//     const quakeDate = new Date(event.features[0].properties.time)

//     if (event.features.length === 0) return

//     mag.textContent = quakeMagnitude
//     loc.textContent = quakeLocation
//     date.textContent = quakeDate

//     if (quakeID) {
//         map.removeFeatureState({
//             source: 'earthquakes',
//             id: quakeID
//         })
//     }

//     quakeID = event.features[0].id

//     map.setFeatureState(
//         {
//             source: 'earthquakes',
//             id: quakeID
//         },
//         {
//             hover: true
//         }
//     )
// })

// map.on('mouseleave', 'earthquakes-viz', () => {
//     if (quakeID) {
//         map.setFeatureState(
//             {
//                 source: 'earthquakes',
//                 id: quakeID
//             },
//             {
//                 hover: false
//             }
//         )
//     }

//     quakeID = null

//     mag.textContent = ''
//     loc.textContent = ''
//     date.textContent = ''

//     map.getCanvas().style.cursor = ''
// })