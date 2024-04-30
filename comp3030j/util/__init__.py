import os

from io import StringIO
import csv
from datetime import datetime, timedelta
from flask_babel import gettext as _tr, ngettext as _ntr, lazy_gettext as _ltr

from comp3030j import app


# __all__=['_tr', '_ntr', '_ltr']


def allowed_img(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in {"png", "jpg"}


def allowed_file(filename):
    if "." in filename and filename.rsplit(".", 1)[1].lower() in {"csv", "xlsx", "xls"}:
        return filename.rsplit(".", 1)[1].lower()
    return False


def save_file(file, path, file_name):
    file.save(os.path.join(app.root_path, path, file_name))


def delete_file(path, file_name):
    try:
        os.remove(os.path.join(app.root_path, path, file_name))
    except FileNotFoundError:
        pass


def parse_iso_string(iso_8601_string: str) -> datetime:
    return datetime.strptime(iso_8601_string, "%Y-%m-%dT%H:%M:%S.%f%z")


def to_iso_string(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%fZ")


def read_hourly_usage_csv(csv_file):
    """
    parameter:
        name:         string describing the profile.
        csv_filename: string to the file to be read

    Read a csv-file with power consumption time series for an enterprise
    """
    csv_data = csv_file.read().decode("utf-8")
    csv_file.seek(0)  # Reset file pointer to the beginning for subsequent reads
    reader = csv.reader(StringIO(csv_data), delimiter=",")
    header_time = next(reader)[1:]
    hourly_series = []
    timestamp_series = []
    for row in reader:
        date = row[0]
        # Iterate through each hourly consumption value in the row
        for i, consumption in enumerate(row[1:], start=1):
            # Convert consumption to float or None if it's not numeric
            try:
                consumption_value = float(consumption)
            except ValueError:
                consumption_value = None
            timestamp = datetime.strptime(
                date + " " + header_time[i - 1] + " +01:00", "%d/%m/%Y %H:%M %z"
            )
            # Append timestamp and consumption value to respective lists
            timestamp_series.append(timestamp)
            hourly_series.append(consumption_value)

    return dict({t: v for t, v in zip(timestamp_series, hourly_series)})
