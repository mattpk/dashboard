#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

const URL = 'https://wttr.in/Toronto?format=j1';
const OUTPUT_FILE = 'weather.json';
const INTERVAL = 300 * 1000; // 5 minutes in ms

function fetchWeather() {
  https.get(URL, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        fs.writeFile(OUTPUT_FILE, JSON.stringify(json, null, 2), (err) => {
          if (err) {
            console.error('Error writing file:', err);
          } else {
            console.log(`Updated ${OUTPUT_FILE}`);
          }
        });
      } catch (e) {
        console.error('Error parsing weather JSON:', e);
      }
    });
  }).on('error', (e) => {
    console.error('Error fetching weather:', e);
  });
}

function main() {
  fetchWeather();
  setInterval(fetchWeather, INTERVAL);
}

main();
