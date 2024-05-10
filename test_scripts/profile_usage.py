import requests, json
from datetime import datetime, timedelta

HEADERS = {"Authorization": "Bearer dac6164cd0cf4ea6b539aa2a6a1f457d"}

start_time = datetime(year=2023, month=4, day=1)
one_hour = timedelta(hours=1)
end_time = start_time + 5 * one_hour

# print(start_time, end_time)

res = requests.post(
    "http://127.0.0.1:5000/api/v1/profile/1/usage",
    headers=HEADERS,
    json={
        "start_time": "1990-1-31T23:00:00.000Z",
        "end_time": "2025-2-22T23:00:00.000Z",
        "aggregate": "day",
    },
)
if res.ok:
    print("response body:", json.dumps(res.json(), indent=4))
else:
    print("response body", res.text)


res = requests.post(
    "http://127.0.0.1:5000/api/v1/profile/1/usage",
    headers=HEADERS,
    json={
        "start_time": "1990-1-31T23:00:00.000Z",
        "end_time": "2025-2-22T23:00:00.000Z",
        "aggregate": "month",
    },
)
if res.ok:
    print("response body:", json.dumps(res.json(), indent=4))
else:
    print("response body", res.text)


res = requests.post(
    "http://127.0.0.1:5000/api/v1/profile/1/usage",
    headers=HEADERS,
    json={
        "start_time": "1990-1-31T23:00:00.000Z",
        "end_time": "2025-2-22T23:00:00.000Z",
        "aggregate": "year",
    },
)
if res.ok:
    print("response body:", json.dumps(res.json(), indent=4))
else:
    print("response body", res.text)
