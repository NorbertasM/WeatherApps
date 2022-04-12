const apiKey = 'b426d8fb303756ee1b6752f9bf8dc621'

const days = [
  'Sekmadienis',
  'Pirmadienis',
  'Antradienis',
  'Trečiadienis',
  'Ketvirtadienis',
  'Penktadienis',
  'Šeštadienis',
]

const months = [
  'Saus',
  'Vas',
  'Kov',
  'Bal',
  'Geg',
  'Jun',
  'Jul',
  'Rug',
  'Rug',
  'Spal',
  'Lap',
  'Gru',
]

const getWindDirection = (degrees) => {
  directions = ['Šiaurės', 'Šiaurės rytų', 'Rytų', 'Pietryčių', 'Pietų', 'Pietvakarių', 'Vakarų', 'Šiaurės vakarų']
  
  return directions[(Math.round(degrees * 8 / 360) + 8) % 8]
}

const getTime = (unix) => {
  const date = new Date(unix * 1000)

  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

const getDayLength = (unix) => {
  const hours = parseInt(unix / 3600)
  const minutes = parseInt(unix % 3600 / 60)
  const seconds = unix % 60

  return `${hours}:${minutes}:${seconds}`
}

function initMap() {
  const myLatlng = { lat: -25.363, lng: 131.044 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: myLatlng,
    draggableCursor: 'default'
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(initialLocation);
    });
}
  map.addListener("click", (mapsMouseEvent) => {
    const lon = mapsMouseEvent.latLng.lng()
    const lat = mapsMouseEvent.latLng.lat()

    fetchForecast({
      lon,
      lat,
    })
  });
}

const fetchForecast = async ({ lon, lat }) => {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${apiKey}`)

    if (res) {
      data = await res.json()
      showWeatherData(data)
    }
  } catch (error) {
    console.log(error)
  }
}

const fetchWeather = async (input) => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${input}&appid=${apiKey}&units=metric&lang=lt`)

    if (response) {
      const data = await response.json()
      if (data) {
        const { coord, name, sys : { sunrise, sunset } } = data
        const { icon, description } = data.weather[0]
        const { feels_like, temp, humidity } = data.main
        const { deg, speed } = data.wind
        showCurrent({
          name,
          temp,
          feels_like,
          description,
          humidity,
          speed,
          sunrise,
          sunset,
          deg,
          icon
        })

        fetchForecast(coord)
      }
    }
  } catch (error) {
    console.log(error)
  }
}

const showCurrent = ({ name, temp, feels_like, description, humidity, speed, sunrise, sunset, deg, icon }) => {
  if (name) {
    document.querySelector('.city').innerText = `Oras mieste ${name}`
  }
  document.querySelector('.temp').innerText = `${temp}°C`
  document.querySelector('.feelsLike').innerText = `Pojūtis ${feels_like}°C`
  document.querySelector('.description').innerText = description
  document.querySelector('.humidity').innerText = `Oro dregnumas: ${humidity}%`
  document.querySelector('.wind').innerText = `Vejo greitis: ${speed}m/s`
  document.querySelector('.sunrise').innerText = `Saulė teka: ${getTime(sunrise)}`
  document.querySelector('.sunset').innerText = `Saulė leidžiasi: ${getTime(sunset)}`
  document.querySelector('.daylength').innerText = `Dienos ilgumas: ${getDayLength(sunset - sunrise)}`
  document.querySelector('.windDirection').innerText = `Vėjo kryptis: ${getWindDirection(deg)}`
  document.querySelector('.icon').src = `http://openweathermap.org/img/wn/${icon}@2x.png`
  document.querySelector('.weather').classList.remove('loading')
  document.body.style.backgroundImage = `url('https://source.unsplash.com/1600x900/?${name}')`
}

const changeToGraphs = () => {
  const button = document.querySelector('.button')
  button.innerText = 'Prognozė'
  button.removeEventListener('click', changeToGraphs)
  button.addEventListener('click', changeToForecast)

  document.querySelector('.inputs-container').classList.add('loading')
}

const changeToForecast = () => {
  const button = document.querySelector('.button')
  button.innerText = 'Grafikai'
  button.removeEventListener('click', changeToForecast)
  button.addEventListener('click', changeToGraphs)

  document.querySelector('.inputs-container').classList.remove('loading')
}

const showWeatherData = (info) => {
  const weatherForecast = document.querySelector('.weather-forecast')
  document.querySelector('.future-forecast').classList.remove('loading')
  weatherForecast.innerHTML = null

  const d = new Date()
  const dayName = days[d.getDay()]
  
  if (!document.querySelector('.city').innerText) {
    showCurrent({
      temp: info.current.temp,
      feels_like: info.current.feels_like,
      description: info.current.weather[0]?.description,
      humidity: info.current.humidity,
      speed: info.current.wind_speed,
      sunrise: info.current.sunrise,
      sunset: info.current.sunset,
      deg: info.current.wind_deg,
      icon: info.current.weather[0]?.icon,
    })
  }

  if (info?.daily) {
    info.daily.map(day => {
      const container = document.createElement('div')
      container.setAttribute('class', 'weather-forecast-item')
      weatherForecast.appendChild(container)

      const dayContainer = document.createElement('div')
      dayContainer.setAttribute('class', 'day')
      dayContainer.innerText = dayName
      container.appendChild(dayContainer)
      
      const weatherImg = document.createElement('img')
      weatherImg.setAttribute('src', `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`)
      weatherImg.setAttribute('alt', 'weather-icon')
      container.appendChild(weatherImg)

      const dayWeather = document.createElement('div')
      dayWeather.setAttribute('class', 'temperature')
      dayWeather.innerText = `Diena ${day.temp.day}°C`
      container.appendChild(dayWeather)
      
      const nightWeather = document.createElement('div')
      nightWeather.setAttribute('class', 'temperature')
      nightWeather.innerText = `Naktis ${day.temp.night}°C`
      container.appendChild(nightWeather)
    })

    const button = document.querySelector('.button')
    
    button.addEventListener('click', changeToGraphs)
  }
}

document.querySelector('.search-bar').addEventListener('keyup', function (event) {
  if (event.key == 'Enter') {
    fetchWeather(document.querySelector('.search-bar').value)
  }
})
