from comp3030j.db import db
from comp3030j.db.SEMSpot import SEMSpot
from datetime import datetime
from typing import List
from .decorators import parse_data_request, aggregate_result


@parse_data_request
@aggregate_result
def semspot_route(*args, **kwargs):
    return get_semspot(*args, **kwargs)


def get_semspot(start_dt: datetime, end_dt: datetime) -> List[SEMSpot]:
    """
    request body:
    {
        # data range specification
        start_time : str, ISO 8601 formatted time = "",
        end_time : str, ISO 8601 formatted time = "",
        span_hours : integer = "",
        # data format specification
        sum_hours : int = ""
    }

    All values are technically optional, will return datapoints according
    to the combination of parameters received:

    [start_time, end_time],
    [start_time, start_time + span_hours], or
    [end_time - span_hours, end_time], or
    [profile.start_time, end_time] if only end_time is specified, or
    [start_time, profile.end_time] if only start_time is specified

    if `aggregate` is not specified or blank, the returned list will consist of a
    naiively serialized json representation of the underlying database with ORM-relations
    elided. Otherwise, the only time varying data column will be returned, in the form of:

    List[List[time: str, usage: float]]

    Where the time-varying column will be summed on a left-aligned basis.
    NOTE: UNFULL BRACKETS WILL BE RETURNED!
    """

    result = db.session.scalars(
        db.select(SEMSpot).filter(SEMSpot.time.between(start_dt, end_dt))
    )
    result_list = list(result)  # turn consumable iterator into imperishable list
    result_list.sort(key=lambda entry: entry.time)
    return result_list
