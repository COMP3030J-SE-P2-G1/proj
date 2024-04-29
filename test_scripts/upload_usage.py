import requests, json
from datetime import datetime, timedelta
HEADERS = {
    "Authorization": "Bearer dac6164cd0cf4ea6b539aa2a6a1f457d"
}

with open("demo_2023.csv", 'rb') as fobj:
    res = requests.post(
        "http://127.0.0.1:5000/dashboard/update_usage", files={'file': fobj}
    )
print("response code:", res)
if res.ok:
    # TODO: check the response body
    print("response body:", json.dumps(res.json(), indent=3))
