// Fetch weather data for Toronto using wttr.in
async function fetchWeather() {
  try {
    const response = await fetch('https://wttr.in/Toronto?format=j1');
    const data = await response.json();

    const weatherContent = document.querySelector('.weather-content');
    const current = data.current_condition[0];
    const today = data.weather[0];
    const tomorrow = data.weather[1];

    // Function to get weather icon based on description
    function getWeatherIcon(description) {
      const desc = description.toLowerCase();
      if (desc.includes('clear') || desc.includes('sunny')) return '☀️';
      if (desc.includes('partly cloudy') || desc.includes('partly cloud')) return '⛅';
      if (desc.includes('cloudy') || desc.includes('overcast')) return '☁️';
      if (desc.includes('rain') || desc.includes('shower')) return '🌧️';
      if (desc.includes('snow')) return '❄️';
      if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
      if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
      if (desc.includes('wind')) return '💨';
      return '🌤️'; // default
    }

    // Current weather
    const temp = current.temp_C;
    const condition = current.weatherDesc[0].value;
    const precip = current.precipMM;
    const currentIcon = getWeatherIcon(condition);

    // Function to process hourly data
    function processHourlyData(hourlyData) {
      let html = '';
      hourlyData.forEach(hour => {
        const time = hour.time;
        const hourTemp = hour.tempC;
        const hourPrecip = hour.precipMM;
        const hourDesc = hour.weatherDesc[0].value;
        const icon = getWeatherIcon(hourDesc);

        // Convert minutes to 12-hour format
        const hour24 = Math.floor(time / 100);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 < 12 ? 'AM' : 'PM';
        const timeStr = hour12 + ':00 ' + ampm;

        html += `
          <div class="hourly-item">
            <div class="hour-time">${timeStr}</div>
            <div class="hour-icon">${icon}</div>
            <div class="hour-temp">${hourTemp}&deg;C</div>
            <div class="hour-precip">${hourPrecip}mm</div>
            <div class="hour-desc">${hourDesc}</div>
          </div>
        `;
      });
      return html;
    }

    // Process today's and tomorrow's forecasts
    const todayHTML = processHourlyData(today.hourly);
    const tomorrowHTML = processHourlyData(tomorrow.hourly);

    weatherContent.innerHTML = `
      <div class="current-weather">
        <div class="current-icon">${currentIcon}</div>
        <div class="temperature">${temp}&deg;C</div>
        <div class="condition">${condition}</div>
        <div class="precipitation">Precipitation: ${precip}mm</div>
      </div>
      <div class="hourly-forecast">
        <h3>Today's Forecast</h3>
        <div class="hourly-grid">
          ${todayHTML}
        </div>
      </div>
      <div class="hourly-forecast">
        <h3>Tomorrow's Forecast</h3>
        <div class="hourly-grid">
          ${tomorrowHTML}
        </div>
      </div>
    `;
  } catch (error) {
    document.querySelector('.weather-content').innerHTML = '<div class="error">Unable to load weather data</div>';
  }
}

// Load weather on page load
fetchWeather();

// Refresh weather data every 2 minutes (120,000 ms)
setInterval(fetchWeather, 120000);
