const apiKey = 'c0fb164a8fbc24b9ce64e2dacb7ae2be';
const apiUrl = "https://api.openweathermap.org/data/2.5/";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector("#weather-icon");
const forecastContainer = document.querySelector("#forecast-container");

// Function to fetch weather data
async function getWeather(city) {
    try {
        const response = await fetch(`${apiUrl}weather?q=${city}&units=metric&appid=${apiKey}`);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        updateWeather(data);
        
        // Fetch forecast data based on coordinates obtained from weather data
        const { lat, lon } = data.coord;
        const forecastResponse = await fetch(`${apiUrl}forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        const forecastData = await forecastResponse.json();
        populateForecast(forecastData.list);
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data. Please try again.');
    }
}

function updateWeather(data) {
    document.querySelector(".city").textContent = data.name;
    document.querySelector(".temp").textContent = Math.round(data.main.temp) + " °C";
    document.querySelector(".humidity").textContent = data.main.humidity + " %";
    document.querySelector(".wind").textContent = data.wind.speed + " km/h";

    const localTime = new Date((data.dt + data.timezone) * 1000);
    const sunrise = new Date((data.sys.sunrise + data.timezone) * 1000);
    const sunset = new Date((data.sys.sunset + data.timezone) * 1000);
    const timeOfDay = getTimeOfDay(localTime, sunrise, sunset);

    document.querySelector(".day-night").textContent = timeOfDay;
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    
    updateDateTime(localTime);
}

function populateForecast(data) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    forecastContainer.innerHTML = ''; // Clear previous forecast data

    for (let i = 0; i < 5; i++) {
        const forecast = data[i * 8]; // Get data for each day (every 8th index for 24 hours interval)
        const day = new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });

        const forecastCard = document.createElement('div');
        forecastCard.classList.add('cards');

        forecastCard.innerHTML = `
            <h2 class="day-name text">${day}</h2>
            <div class="card-icon">
                <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@4x.png" alt="Weather Icon">
            </div>
            <div class="day-temp">
                <h3 class="text temp">${Math.round(forecast.main.temp)} °C</h3>
            </div>
        `;

        forecastContainer.appendChild(forecastCard);
    }
}

function getTimeOfDay(localTime, sunrise, sunset) {
    const hour = localTime.getUTCHours();
    if (hour >= 0 && hour < 6) {
        return "Night";
    } else if (hour >= 6 && hour < 12) {
        return "Morning";
    } else if (hour >= 12 && hour < 15) {
        return "Noon";
    } else if (hour >= 15 && hour < 18) {
        return "Afternoon";
    } else if (hour >= 18 && hour < 21) {
        return "Evening";
    } else {
        return "Night";
    }
}

function updateDateTime(localTime) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[localTime.getUTCDay()];
    const hours = localTime.getUTCHours();
    const minutes = localTime.getUTCMinutes();
    const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;

    document.getElementById("current-day-time").textContent = `${day}, ${formattedTime}`;
}

searchBtn.addEventListener("click", () => {
    getWeather(searchBox.value);
});

searchBox.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        getWeather(searchBox.value);
    }
});

// Geolocation
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const geoApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
            fetch(geoApiUrl)
                .then(response => response.json())
                .then(data => {
                    updateWeather(data);
                    const { lat, lon } = data.coord;
                    return fetch(`${apiUrl}forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
                })
                .then(response => response.json())
                .then(data => {
                    populateForecast(data.list);
                });
        });
    }
};
