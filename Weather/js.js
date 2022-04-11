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
  //might need to fix
  const hours = parseInt(unix / 3600)
  const minutes = parseInt(unix % 3600 / 60)
  const seconds = unix % 60

  return `${hours}:${minutes}:${seconds}`
}

// setInterval(() => {
//   const time = new Date()
//   const month = time.getMonth()
//   const date = time.getDate()
//   const day = time.getDay()
//   const hour = time.getHours()
//   const hours = hour >= 13 ? hour % 12 : hour
//   const minutes = time.getMinutes()
//   const ampm = hour >= 12 ? 'PM' : 'AM'
//   timeEl.innerHTML =
//     (hours < 10 ? '0' + hours : hours) +
//     ':' +
//     (minutes < 10 ? '0' + minutes : minutes) +
//     ' ' +
//     `<span id='am-pm'>${ampm}</span>`
//   dateEl.innerHTML = days[day - 1] + ', ' + date + ' ' + months[month]
// }, 1000)

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
        document.querySelector('.city').innerText = `Oras mieste ${name}`
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
        fetchForecast(coord)
      }
    }
  } catch (error) {
    console.log(error)
  }
}

const showWeatherData = (info) => {
  const weatherForecast = document.querySelector('.weather-forecast')
  document.querySelector('.future-forecast').classList.remove('loading')
  weatherForecast.innerHTML = null

  const d = new Date()
  const dayName = days[d.getDay()]
  
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

}

document.querySelector('.search-bar').addEventListener('keyup', function (event) {
  if (event.key == 'Enter') {
    fetchWeather(document.querySelector('.search-bar').value)
  }
})
