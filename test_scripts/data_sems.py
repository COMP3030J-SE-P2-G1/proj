import requests, json
from datetime import datetime, timedelta

start_time = datetime(year=2020, month=4, day=1)
one_hour = timedelta(hours=1)
end_time = start_time + 5 * one_hour

print(start_time, end_time)

res = requests.post(
    "http://127.0.0.1:5000/api/data/sems",
    json={
        "start_time": start_time.strftime("%Y-%m-%d %H:%M:%S"),
        "end_time": end_time.strftime("%Y-%m-%d %H:%M:%S"),
    },
)
print("response code:", res)
if res.ok:
    print("response body:", json.dumps(res.json(), indent=4))
res = requests.post(
    "http://127.0.0.1:5000/api/data/sems",
    json={},
)
print("response code:", res)
if res.ok:
    print("response body:", json.dumps(res.json(), indent=4))
