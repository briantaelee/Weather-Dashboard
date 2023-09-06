const apiKey = '6c3cba69372facf50f7add81462ea280';

const cityInput = document.getElementById('city-input');
const searchForm = document.getElementById('search-form');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');
const searchHistory = document.getElementById('search-history');

searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const cityName = cityInput.value;

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const { lat, lon } = data.coord;
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        })
        .then(response => response.json())
        .then(weatherData => {
            displayCurrentWeather(weatherData);
            displayForecast(weatherData);
            addToSearchHistory(cityName);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });

    cityInput.value = '';
});

function displayCurrentWeather(data) {
    if (!data || !data.main || !data.main.temp) {
        console.error('Invalid or missing data in the API response.');
        return;
    }

    const { name, dt, main, wind } = data;
    const date = new Date(dt * 1000);

    currentWeather.innerHTML = `
        <h2>${name}</h2>
        <p>Date: ${date.toLocaleString()}</p>
        <p>Temperature: ${main.temp}°C</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} m/s</p>
    `;
}

function displayForecast(data) {
    const forecastList = data.list;
    const forecastByDate = {};

    const currentDate = new Date();

    forecastList.forEach(forecastData => {
        const date = new Date(forecastData.dt * 1000);

        if (date >= currentDate && date <= new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000)) {
            const dateKey = date.toLocaleDateString();

            if (!forecastByDate[dateKey]) {
                forecastByDate[dateKey] = {
                    date: dateKey,
                    temperature: [],
                    humidity: [],
                    windSpeed: [],
                };
            }

            forecastByDate[dateKey].temperature.push(forecastData.main.temp);
            forecastByDate[dateKey].humidity.push(forecastData.main.humidity);
            forecastByDate[dateKey].windSpeed.push(forecastData.wind.speed);
        }
    });

    forecast.innerHTML = '';

    for (const dateKey in forecastByDate) {
        if (forecastByDate.hasOwnProperty(dateKey)) {
            const forecastData = forecastByDate[dateKey];
            const averageTemperature = calculateAverage(forecastData.temperature);
            const averageHumidity = calculateAverage(forecastData.humidity);
            const averageWindSpeed = calculateAverage(forecastData.windSpeed);

            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item');
            forecastItem.innerHTML = `
                <h3>${forecastData.date}</h3>
                <p>Average Temperature: ${averageTemperature.toFixed(2)}°C</p>
                <p>Average Humidity: ${averageHumidity.toFixed(2)}%</p>
                <p>Average Wind Speed: ${averageWindSpeed.toFixed(2)} m/s</p>
            `;

            forecast.appendChild(forecastItem);
        }
    }
}


function calculateAverage(arr) {
    const sum = arr.reduce((total, value) => total + value, 0);
    return sum / arr.length;
}

