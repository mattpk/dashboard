# dashboard
dead simple page to run on an old android tablet showing weather and TTC arrivals

It's for my own usecase, so hardcoded for a 1024x600 resolution tablet

## fetch_weather
if having the server cache weather instead of the client, run on server
```
forever restart fetch_weather.js
```

## TTC arrivals
The footer shows up to 3 next-vehicle countdowns via the `?stops=` querystring. Each entry is `<route>:<stopCode>`, comma-separated.

The browser queries `https://www.ttc.ca/ttcapi/routedetail/GetNextBuses` directly every 30 seconds.

## hosting
once the fetch script is running just serve `index.html` using apache / nginx.
if testing locally `python3 -m http.server 8000` is useful, otherwise CORS prevents loading the data jsons.
