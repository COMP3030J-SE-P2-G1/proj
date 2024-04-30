import requests, json
from datetime import datetime, timedelta

start_time = datetime(year=2023, month=4, day=1)
one_hour = timedelta(hours=1)
end_time = start_time + 5 * one_hour
#
# print(start_time.isoformat(), end_time.isoformat())

res = requests.post(
    "http://127.0.0.1:5000/api/profile/1/solar",
    json={
        "start_time": "2022-12-31T23:00:00.000Z",
        "end_time": "2023-01-02T23:00:00.000Z",
        "api": "new",
    },
)
print("response code:", res)
if res.ok:
    print("response body:", json.dumps(res.json(), indent=4))


# res = requests.post("http://127.0.0.1:5000/api/profile/1/solar", json={})
# print("response code:", res)
# if res.ok:
#     print("response body:", json.dumps(res.json(), indent=4))
