import TOKEN from '../../config.js'

// Open and close menu
document.getElementById('toggle-menu').addEventListener('click', () => {
    document.getElementById('full-menu').classList.replace('inactive', 'active')
    document.getElementById('toggle-menu').classList.replace('active', 'inactive')
    document.getElementById('theme-toggle').classList.replace('inactive', 'active')
    document.getElementById('close').classList.replace('inactive', 'active')
})

document.getElementById('close').addEventListener('click', () => {
    document.getElementById('full-menu').classList.replace('active', 'inactive')
    document.getElementById('theme-toggle').classList.replace('active', 'inactive')
    document.getElementById('close').classList.replace('active', 'inactive')
    document.getElementById('toggle-menu').classList.replace('inactive', 'active')
})

// Light and dark mode toggle
let isLightMode = true
const root = document.querySelector(':root')

document.getElementById('theme-toggle').addEventListener('click', () => {
    if (isLightMode) {
        document.getElementById('map').style.filter = 'invert()'
        root.style.setProperty('--theme-one', '#fff')
        root.style.setProperty('--theme-two', '#000')
        root.style.setProperty('--theme-three', '#ffffff4d')
        root.style.setProperty('--theme-four', '#ffffff26')
        isLightMode = false
    } else {
        document.getElementById('map').style.filter = 'none'
        root.style.setProperty('--theme-one', '#000')
        root.style.setProperty('--theme-two', '#fff')
        root.style.setProperty('--theme-three', '#0000004d')
        root.style.setProperty('--theme-four', '#00000026')
        isLightMode = true
    }
})

// Recent five earthquakes carousel
const buttons = document.querySelectorAll("[data-carousel-button]")

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const offset = button.dataset.carouselButton === "next" ? 1 : -1
        const slides = button
            .closest("[data-carousel]")
            .querySelector("[data-slides]")

        const activeSlide = slides.querySelector("[data-active]")
        let newIndex = [...slides.children].indexOf(activeSlide) + offset
        if (newIndex < 0) newIndex = slides.children.length - 1
        if (newIndex >= slides.children.length) newIndex = 0

        slides.children[newIndex].dataset.active = true
        delete activeSlide.dataset.active
    })
})


fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
    .then(response => response.json())
    .then(data => {
        for (let i = 0; i < 5; i++) {
            let coords = data.features[i].geometry.coordinates
            let place = data.features[i].properties.place
            let datetime = new Date(data.features[i].properties.time)
            let time = moment(datetime).format('LT')
            let date = moment(datetime).format('DD-MM-YYYY')
            let mag = `M ${data.features[i].properties.mag.toFixed(1)}`

            document.getElementsByClassName('slide')[i].innerHTML = `<div class="slide-details"><p>${time}</p><div class="slide-subheading"><p>${mag}</p><p>${date}</p></div></div>`

            const img = document.createElement('img')
            img.src = `https://api.mapbox.com/v4/mapbox.satellite/${coords[0]},${coords[1]},7/360x80@2x.png?access_token=${TOKEN}`
            img.alt = place

            document.getElementsByClassName('slide')[i].appendChild(img)
        }
    })