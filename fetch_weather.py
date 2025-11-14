#!/bin/bash
'''exec' python3 "$0" "$@"
' '''
import time
import json
import urllib.request

URL = "https://wttr.in/Toronto?format=j1"
OUTPUT_FILE = "weather.json"
INTERVAL = 300  # 5 minutes

def fetch_weather():
    try:
        with urllib.request.urlopen(URL, timeout=10) as response:
            data = json.load(response)
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Updated {OUTPUT_FILE}")
    except Exception as e:
        print(f"Error fetching weather: {e}")

def main():
    while True:
        fetch_weather()
        time.sleep(INTERVAL)

if __name__ == "__main__":
    main()
