import requests, json
from datetime import datetime, timedelta

HEADERS = {"Authorization": "Bearer dac6164cd0cf4ea6b539aa2a6a1f457d"}

# bracketed loading
res = requests.post(
    "http://127.0.0.1:5000/api/v1/data/sems",
    headers=HEADERS,
    json={
        "start_time": "1990-1-31T23:00:00.000Z",
        "end_time": "2025-2-22T23:00:00.000Z",
        "aggregate": "hour",
    },
)
if res.ok:
    print("response body:", json.dumps(res.json(), indent=4))
else:
    print("response body", res.text)


# single ended loading
res = requests.post(
    "http://127.0.0.1:5000/api/v1/data/sems",
    headers=HEADERS,
    json={
        "start_time": "1990-1-31T23:00:00.000Z",
        "end_time": "2025-2-22T23:00:00.000Z",
        "aggregate": "day",
    },
)
print("response code:", res)

print("response body:", json.dumps(res.json(), indent=4))


# single ended loading
res = requests.post(
    "http://127.0.0.1:5000/api/v1/data/sems",
    headers=HEADERS,
    json={
        "start_time": None,
        "start_time": "1990-1-31T23:00:00.000Z",
        "end_time": "2025-2-22T23:00:00.000Z",
        "aggregate": "month",
    },
)
if res.ok:
    print("response body:", json.dumps(res.json(), indent=4))
else:
    print("response body", res.text)

# single ended loading
res = requests.post(
    "http://127.0.0.1:5000/api/v1/data/sems",
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
