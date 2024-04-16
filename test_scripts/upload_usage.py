import requests, json
from datetime import datetime, timedelta


with open("demo_2023.csv", 'rb') as fobj:
    res = requests.post(
        "http://127.0.0.1:5000/dashboard/update_usage", files={'file': fobj}
    )
print("response code:", res)
if res.ok:
    print("response body:", json.dumps(res.json(), indent=3))
