#!/usr/bin/env python3
import time
import json
import sys

try:
    from urllib.request import urlopen
except ImportError:
    from urllib2 import urlopen

URL = "https://wttr.in/Toronto?format=j1"
OUTPUT_FILE = "weather.json"
INTERVAL = 300  # 5 minutes

def fetch_weather():
    try:
        response = urlopen(URL, timeout=10)
        try:
            raw = response.read()
            if sys.version_info[0] >= 3 and isinstance(raw, bytes):
                raw = raw.decode("utf-8")
            data = json.loads(raw)
        finally:
            response.close()
        with open(OUTPUT_FILE, "w") as f:
            json.dump(data, f, indent=2)
        print("Updated {}".format(OUTPUT_FILE))
    except Exception as e:
        print("Error fetching weather: {}".format(e))

def main():
    while True:
        fetch_weather()
        time.sleep(INTERVAL)

if __name__ == "__main__":
    main()
