from . import db

from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy_utc import UtcDateTime
from sqlalchemy import Numeric


class SEMSpot(db.Model, SerializerMixin):
    """
    Single Electricity Market Spot Profile
    required attr:
        time: hourly timestamp
        spot: price in EUR/MWh
    """

    datetime_format = "%Y-%m-%dT%H:%M:%S.%fZ"

    __tablename__ = "sems"
    time: Mapped[datetime] = mapped_column(UtcDateTime(), primary_key=True)
    spot: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False), nullable=False)

    def to_timeseries(self):
        return self.spot
