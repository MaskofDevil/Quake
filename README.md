
![Logo](./src/assets/Logo.png)


# Quake

Quake is a realtime earthquake visualization web application.


## Screenshots

![Quake Screenshot](./src/assets/quake.png)


##### Project Structure:

    Quake/
    ├── src/
    |   ├── assets/
    |   |   ├── favicon.ico
    |   |   ├── Logo.png
    |   |   ├── quake.png
    |   |   └── volcano.png
    |   ├── css/
    |   |   └── style.css
    |   └── js/
    |       ├── map.js
    |       └── script.js
    ├── config.js
    ├── index.html
    └── README.md


## Features

- Realtime earthquake data
- Specific earthquake data(by day, month, year and magnitude)
- Visualization of tectonic plates, orogens & volcanoes
- Different styles (such as - light, dark, night, street)


## Run Locally

Clone the project

```
  git clone https://link-to-project
```

Go to the project directory

```
  cd my-project
```

Get access token from Mapbox, replace it with YOUR_ACCESS_TOKEN below and paste the whole code inside config.js

```
  const TOKEN = 'YOUR_ACCESS_TOKEN'
  export default TOKEN
```

Open index.html in any web browser


## Tech Stack

**Client:** HTML, CSS, JavaScript

**Server:** Mapbox GL JS, Mapbox Tileset api, USGS api