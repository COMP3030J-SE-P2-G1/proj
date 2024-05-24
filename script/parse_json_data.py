import json
from datetime import datetime, timedelta


def read_solar_json(json_filename: str):
    """
    Read a result of a query to PVGIS online API and put it into the database
    """

    with open(json_filename) as file:
        data = json.load(file)

    location = data["inputs"]["location"]
    lat, lon = float(location["latitude"]), float(location["longitude"])

    pv_module = data["inputs"]["pv_module"]
    technology = pv_module["technology"]
    # technology is encoded as intergers in database:

    if technology == "c-Si":
        tech_code = 0
    elif technology == "CIS":
        tech_code = 1
    elif technology == "CdTe":
        tech_code = 2
    else:
        raise ValueError("unknown technology string.")

    power = pv_module["peak_power"]
    loss = pv_module["system_loss"]

    eleven_minute = timedelta(minutes=11)

    inputs = (lat, lon, tech_code, power, loss)
    series_dict = {}
    for datapoint in data["outputs"]["hourly"]:
        time, power_out = datapoint["time"], datapoint["P"]

        # read only to the hour-time, implicitly normalizing timestamp
        timestamp = (
            datetime.strptime(time + " +01:00", "%Y%m%d:%H%M %z") - eleven_minute
        )
        # convert power_out (in watts) to generation (in kilojoules)
        generation = power_out * 1e-3
        series_dict.update({timestamp: generation})

    return inputs, series_dict


if __name__ == "__main__":
    print(read_solar_json("data.json"))
