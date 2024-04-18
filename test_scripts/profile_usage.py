import requests, json
from datetime import datetime, timedelta

start_time = datetime(year=2023, month=4, day=1)
one_hour = timedelta(hours=1)
end_time = start_time + 5 * one_hour

# print(start_time, end_time)

res = requests.post(
    "http://127.0.0.1:5000/api/profile/1/usage",
    json={
        "start_time": "2023-1-31T23:00:00.000Z",
        "end_time": "2023-2-22T23:00:00.000Z",
        "span_hours": None,
    },
)
print("response code:", res)

print("response body:", json.dumps(res.json(), indent=4))


