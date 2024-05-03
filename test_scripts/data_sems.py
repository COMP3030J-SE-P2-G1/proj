import requests, json
from datetime import datetime, timedelta

HEADERS = {"Authorization": "Bearer dac6164cd0cf4ea6b539aa2a6a1f457d"}

# bracketed loading
res = requests.post(
    "http://127.0.0.1:5000/api/v1/data/sems",
    headers=HEADERS,
    json={
        "start_time": "2022-12-31T23:00:00.000Z",
        "end_time": "2023-01-01T22:00:00.000Z",
        "span_hours": None,
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
        "start_time": "2022-12-31T23:00:00.000Z",
        "end_time": None,
        "span_hours": "25",
        "sum_hours": "1",
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
        "end_time": "2023-12-31T23:00:00.000Z",
        "span_hours": "5",
        "sum_hours": "24",
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
        "start_time": None,
        "end_time": None,
        "span_hours": "5",
    },
)
if res.ok:
    print("response body:", json.dumps(res.json(), indent=4))
else:
    print("response body", res.text)
