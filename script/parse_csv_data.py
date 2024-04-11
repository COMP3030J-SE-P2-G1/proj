"""
Jinpeng Zhai
2024 04 11
Parse csv-formatted data, including time series processing functions,
for filling solarscape database with
a) UCD utility electricity usage.
b) SEM market spot data (as basis for the calculation)
"""

from typing import List, Optional, cast, Dict
import csv
from datetime import datetime, timedelta


def linear_interpolate_missing_datapoints(series: List[Optional[float]]) -> List[float]:
    """
    Given a List of float, return a new List that replaces all None values with
    an linear interpolation using flanking values.

    Note, the first and last values must not be None.
    """
    if series[0] is None or series[-1] is None:
        raise ValueError(
            "cannot do linear interpolation on series, start and end "
            + "values are missing."
        )
    filled_series = []  # list[float]
    pruned_index = 0
    while None in series[pruned_index:]:
        next_none_offset = series[pruned_index:].index(None)
        next_none_index = next_none_offset + pruned_index
        next_value_index = next_none_index
        while series[next_value_index] is None:
            # increment until next_none_index points to non-None value
            next_value_index += 1
        filled_series.extend(cast(List[float], series[pruned_index:next_none_index]))

        left_value = cast(float, series[next_none_index - 1])
        right_value = cast(float, series[next_value_index])

        for index in range(next_none_index, next_value_index):
            kappa = (index - next_none_index + 1) / (
                next_value_index - next_none_index + 1
            )
            filled_series.append(kappa * right_value + (1 - kappa) * left_value)
        pruned_index = next_value_index
    else:

        filled_series.extend(cast(List[float], series[pruned_index:]))

    return filled_series


def read_spot_from_csv(csv_filename: str) -> Dict[datetime, float]:
    with open(csv_filename, mode="r", encoding="utf-8") as csvfile:
        reader = csv.reader(csvfile, delimiter=",")
        next(reader)  # skip header row
        price_series = dict()
        for row in reader:
            datetimestr, price = row
            dt = datetime.strptime(datetimestr, "%Y-%m-%d %H:%M:%S")
            price_series.update({int(dt.timestamp()): float(price)})

    timestamps = price_series.keys()
    min_timestamp, max_timestamp = min(timestamps), max(timestamps)
    one_hour = timedelta(hours=1)
    filled_timestamps = []
    filled_series: List[Optional[float]] = []

    time = datetime.fromtimestamp(min_timestamp)
    max_time = datetime.fromtimestamp(max_timestamp)
    while time < max_time:
        if int(time.timestamp()) in price_series:
            filled_series.append(price_series[int(time.timestamp())])
        else:
            filled_series.append(None)
        filled_timestamps.append(time)
        time += one_hour

    interpolated_series = linear_interpolate_missing_datapoints(filled_series)

    return dict({t: v for t, v in zip(filled_timestamps, interpolated_series)})


def read_quarter_hourly_usage_csv(csv_filename: str):
    """
    parameter:
        name:         string describing the profile.
        csv_filename: string to the file to be read

    Read a csv-file with power consumption time series for an enterprise
    it is assumed that it is exactly like the example provided in terms of formatting
    time stamps are assumed to be 15 min intervals.
    """
    with open(csv_filename, mode="r", encoding="utf-8") as csvfile:
        reader = csv.reader(csvfile, delimiter=",")
        header_time = next(reader)[1:]
        quarter_hourly_series = []
        timestamp_series = []
        for row in reader:
            date = row[0]
            daily_series = [float(v) if v.isnumeric() else None for v in row[1:]]
            timestamp_series.extend(
                [
                    datetime.strptime(date + " " + time, "%d/%m/%Y %H:%M")
                    for time in header_time
                ]
            )
            quarter_hourly_series.extend(daily_series)

    interpolated_series = linear_interpolate_missing_datapoints(quarter_hourly_series)
    timestamp_series = timestamp_series[::4]
    hourly_series = [
        sum(v) for v in zip(*[interpolated_series[i::4] for i in range(4)])
    ]

    return dict({t: v for t, v in zip(timestamp_series, hourly_series)})


if __name__ == "__main__":
    read_quarter_hourly_usage_csv("UCD_2023_profile.csv")
    read_spot_from_csv("historical-irish-electricity-prices.csv")
