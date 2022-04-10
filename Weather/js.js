"strict";

const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const currentWeatherItems = document.getElementById("current-weather-items");

const country = document.getElementById("country");
const weatherForecast = document.getElementById("weather-forecast");
const currentTemp = document.getElementById("current-temp");
const card = document.getElementById("card");
const search = document.getElementById("search");
const searchBar = document.getElementById("search-bar");
const forecast = document.getElementById("forecast");
const infocard = document.getElementById("info-card");
const days = [
  "Sekmadienis",
  "Pirmadienis",
  "Antradienis",
  "Trečiadienis",
  "Ketvirtadienis",
  "Penktadienis",
  "Šeštadienis",
];
const months = [
  "Saus",
  "Vas",
  "Kov",
  "Bal",
  "Geg",
  "Jun",
  "Jul",
  "Rug",
  "Rug",
  "Spal",
  "Lap",
  "Gru",
];
const API_key = "b1aa21a156ae80e227fb83c24928d7cf";
setInterval(() => {
  const time = new Date();
  const month = time.getMonth();
  const date = time.getDate();
  const day = time.getDay();
  const hour = time.getHours();
  const hours = hour >= 13 ? hour % 12 : hour;
  const minutes = time.getMinutes();
  const ampm = hour >= 12 ? "PM" : "AM";
  timeEl.innerHTML =
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (minutes < 10 ? "0" + minutes : minutes) +
    " " +
    `<span id="am-pm">${ampm}</span>`;
  dateEl.innerHTML = days[day - 1] + ", " + date + " " + months[month];
}, 1000);

function weatherData({ lon, lat }) {
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${API_key}`
  )
    .then((res) => res.json())
    .then((data) => {
      showWeatherData(data);
      console.log(data);
    });
}

const fetchWeather = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric&lang=lt`
    );

    if (response) {
      const data = await response.json();
      if (data && data.coord) {
        weatherData(data.coord);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

function showWeatherData(info) {
  const d = new Date();
  const dayName = days[d.getDay()];
  weatherForecast.innerHTML = null;
  info.daily.forEach((day, i) => {
    const tempSign = day.temp.day && day.temp.night > 0 ? "+" : "-";
    if (i === 0) {
      infocard.innerHTML = `
      <img
          src=" http://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png"
          alt="weather-icon"
          class="w-icon"
        />
        <div class="others">
          <div class="day">${dayName}</div>
          <div class="temperature">Diena ${tempSign}${
        day.temp.day + String.fromCharCode(176)
      }C</div>
          <div class="temperature">Naktis ${tempSign}${
        day.temp.night + String.fromCharCode(176)
      }C</div>
          <div class="humidity">Drėgmė${day.humidity}</div>
          <div class="wind_speed">Vėjo Greitis${day.wind_speed}</div>
        </div>
      `;
    } else {
      weatherForecast.innerHTML += `
        <div class="weather-forecast-item">
            <div class="day">${
              days[i < days.length ? i : days.length - i]
            }</div>
            <img
              src=" http://openweathermap.org/img/wn/${
                day.weather[0].icon
              }@2x.png"
              alt="weather-icon"
              class="w-icon"
            />
            <div class="temperature">Diena  ${tempSign}${
        day.temp.day + String.fromCharCode(176)
      }C</div>
            <div class="temperature">Naktis  ${tempSign}${
        day.temp.night + String.fromCharCode(176)
      }C</div>
            
          </div>
        `;
    }
  });
}

document
  .querySelector(".search-bar")
  .addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
      fetchWeather(document.querySelector(".search-bar").value);
      forecast.style.opacity = 100;
      infocard.style.opacity = 100;
    }
  });
