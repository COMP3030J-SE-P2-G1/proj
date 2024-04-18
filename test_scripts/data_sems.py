import requests, json
from datetime import datetime, timedelta

# bracketed loading
res = requests.post(
    "http://127.0.0.1:5000/api/data/sems",
    json={
        "start_time": "2022-12-31T23:00:00.000Z",
        "end_time": "2023-01-01T22:00:00.000Z",
        "span_hours": None,
    },
)
print("response code:", res)
print("response body:", json.dumps(res.json(), indent=4))


# single ended loading
res = requests.post(
    "http://127.0.0.1:5000/api/data/sems",
    json={
        "start_time": "2022-12-31T23:00:00.000Z",
        "end_time": None,
        "span_hours": "25",
    },
)
print("response code:", res)

print("response body:", json.dumps(res.json(), indent=4))


# single ended loading
res = requests.post(
    "http://127.0.0.1:5000/api/data/sems",
    json={
        "start_time": None,
        "end_time": "2023-12-31T23:00:00.000Z",
        "span_hours": "5",
    },
)
print("response code:", res)

print("response body:", json.dumps(res.json(), indent=4))
# single ended loading
res = requests.post(
    "http://127.0.0.1:5000/api/data/sems",
    json={
        "start_time": None,
        "end_time": None,
        "span_hours": "5",
    },
)
print("response code:", res)

print("response body:", json.dumps(res.json(), indent=4))
