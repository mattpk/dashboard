// Weather icon mapping based on weather codes, accounting for isNight
function getWeatherIcon(weatherCode, weatherDesc, isNight = false) {
  const dayIconMap = {
    '113': '☀️',  // Clear/Sunny
    '116': '⛅',  // Partly Cloudy
    '119': '☁️',  // Cloudy
    '122': '☁️',  // Overcast
    '143': '🌫️',  // Mist
    '176': '🌦️',  // Patchy rain nearby
    '179': '🌧️',  // Patchy snow nearby
    '182': '🌧️',  // Patchy sleet nearby
    '185': '🌧️',  // Patchy freezing drizzle nearby
    '200': '⛈️',  // Thundery outbreaks nearby
    '227': '❄️',  // Blowing snow
    '230': '❄️',  // Blizzard
    '248': '🌫️',  // Fog
    '260': '🌫️',  // Freezing fog
    '263': '🌦️',  // Patchy light drizzle
    '266': '🌧️',  // Light drizzle
    '281': '🌧️',  // Freezing drizzle
    '284': '🌧️',  // Heavy freezing drizzle
    '293': '🌦️',  // Patchy light rain
    '296': '🌧️',  // Light rain
    '299': '🌧️',  // Moderate rain at times
    '302': '🌧️',  // Moderate rain
    '305': '🌧️',  // Heavy rain at times
    '308': '🌧️',  // Heavy rain
    '311': '🌧️',  // Light freezing rain
    '314': '🌧️',  // Moderate or heavy freezing rain
    '317': '🌧️',  // Light sleet
    '320': '🌧️',  // Moderate or heavy sleet
    '323': '❄️',  // Patchy light snow
    '326': '❄️',  // Light snow
    '329': '❄️',  // Patchy moderate snow
    '332': '❄️',  // Moderate snow
    '335': '❄️',  // Patchy heavy snow
    '338': '❄️',  // Heavy snow
    '350': '🌧️',  // Ice pellets
    '353': '🌦️',  // Light rain shower
    '356': '🌧️',  // Moderate or heavy rain shower
    '359': '🌧️',  // Torrential rain shower
    '362': '🌧️',  // Light sleet showers
    '365': '🌧️',  // Moderate or heavy sleet showers
    '368': '❄️',  // Light snow showers
    '371': '❄️',  // Moderate or heavy snow showers
    '374': '🌧️',  // Light showers of ice pellets
    '377': '🌧️',  // Moderate or heavy showers of ice pellets
    '386': '⛈️',  // Patchy light rain with thunder
    '389': '⛈️',  // Moderate or heavy rain with thunder
    '392': '⛈️',  // Patchy light snow with thunder
    '395': '⛈️'   // Moderate or heavy snow with thunder
  };

  // No object spread, manually copy and override
  var nightIconMap = {};
  for (var key in dayIconMap) {
    if (dayIconMap.hasOwnProperty(key)) {
      nightIconMap[key] = dayIconMap[key];
    }
  }
  nightIconMap['113'] = '🌙'; // Clear Night
  nightIconMap['116'] = '☁️'; // Partly Cloudy Night (choose a different icon if desired)

  // Fallback: When no code, make a best-guess using desc and isNight
  function fallback() {
    if (isNight) {
      if (typeof weatherDesc === 'string') {
        if (/cloud/i.test(weatherDesc)) return '☁️';
        if (/clear/i.test(weatherDesc)) return '🌙';
        if (/rain/i.test(weatherDesc)) return '🌧️';
        if (/snow/i.test(weatherDesc)) return '❄️';
        if (/thunder/i.test(weatherDesc)) return '⛈️';
      }
      return '🌙';
    } else {
      return '☀️';
    }
  }

  const iconSet = isNight ? nightIconMap : dayIconMap;
  return iconSet[weatherCode] || fallback();
}

// Get the next 4 morning, noon, evening, or night periods after current time, from today and tomorrow if needed
function getNextNPeriods(weather, n = 4) {
  const ONE_HOUR_BUFFER_MS = 60 * 60 * 1000;
  const wantedTimes = [0, 600, 1200, 1800];
  const periods = [];
  const now = new Date();

  for (let i = 0; i < weather.length; i++) {
    const w = weather[i];
    for (let j = 0; j < w.hourly.length; j++) {
      const h = w.hourly[j];
      const date = w.date;
      const hourNum = parseInt(h.time, 10);
      const dateParts = date.split('-').map(x => parseInt(x, 10));
      const year = dateParts[0];
      const month = dateParts[1];
      const day = dateParts[2];
      const hourOfDay = Math.floor(hourNum / 100);
      h._datetime = new Date(year, month - 1, day, hourOfDay, 0, 0, 0);

      if (
        h._datetime - now > ONE_HOUR_BUFFER_MS &&
        wantedTimes.includes(hourNum)
      ) {
        periods.push(h);
        if (periods.length === n) return periods;
      }
    }
  }
  return periods;
}

// Update the weather display for current and the next 3 hourly periods
function updateWeatherDisplay(current, nextPeriods) {
  const columns = document.querySelectorAll('.weather-column');
  const periodLabels = {
    0: 'NIGHT',
    6: 'MORN',
    12: 'NOON',
    18: 'EVE'
  };

  const periods = [current, ...nextPeriods];
  periods.forEach((data, index) => {
    if (!columns[index] || !data) return;
    const column = columns[index];
    const header = column.querySelector('.weather-header');
    const icon = column.querySelector('.weather-icon');
    const temp = column.querySelector('.weather-temp');
    const feels = column.querySelector('.weather-feels');

    const hour = (data._datetime || new Date()).getHours();
    const isNight = hour >= 18 || hour < 6;
    icon.textContent = getWeatherIcon(
      data.weatherCode,
      data.weatherDesc[0].value,
      isNight
    );
    // Handle current period (current has slightly different structure)
    if (index === 0) {
      header.textContent = "NOW";
      temp.textContent = current.temp_C || current.tempC;
      feels.textContent = `FL: ${current.FeelsLikeC}`;
    } else {
      header.textContent = periodLabels[hour];
      temp.textContent = data.tempC;
      feels.textContent = `FL: ${data.FeelsLikeC}`;
    }
  });
}

function fetchWeatherData() {
  const key = 'weatherCache';
  const ttl = 3 * 60 * 1000;
  try {
    const c = JSON.parse(localStorage.getItem(key) || 'null');
    if (c && c.data && Date.now() - c.timestamp < ttl) {
      return Promise.resolve(c.data);
    }
  } catch (e) {
    return fetch('https://wttr.in/Toronto?format=j1')
      .then(r => r.json())
      .then(data => {
        try {
          localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
        } catch (e) {
          alert("LocalStorage error: " + (e && e.message ? e.message : e));
        }
        return data;
      })
      .catch(error => {
        alert("Fetch error: " + (error && error.message ? error.message : error));
        throw error; // Rethrow so downstream knows
      });
  }

  function fetchWeather() {
    return fetchWeatherData()
      .then(data => {
        const current = data.current_condition[0];
        // Get next 3 periods from both today and tomorrow
        const nextPeriods = getNextNPeriods([data.weather[0], data.weather[1]], 3);
        updateWeatherDisplay(current, nextPeriods);
      })
      .then(() => {
        // render emojis
        twemoji.parse(document.body, { folder: 'svg', ext: '.svg' });
      })
      .catch(error => {
        console.error('Error fetching weather:', error);
      });
  }

  // Load weather on page load
  fetchWeather();

  // Refresh weather data at every 5 minute mark, aligned to the clock
  setTimeout(function () {
    fetchWeather();
    setInterval(fetchWeather, 5 * 60 * 1000);
  }, (5 - new Date().getMinutes() % 5) * 60000 - new Date().getSeconds() * 1000 - new Date().getMilliseconds());

