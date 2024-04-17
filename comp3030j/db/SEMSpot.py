from . import db

from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy_utc import UtcDateTime


class SEMSpot(db.Model, SerializerMixin):
    """
    Single Electricity Market Spot Profile
    required attr:
        time: hourly timestamp
        spot: price in EUR/MWh
    """

    datetime_format = "%Y-%m-%dT%H:%M:%SZ"

    __tablename__ = "sems"
    time: Mapped[datetime] = mapped_column(UtcDateTime(), primary_key=True)
    spot: Mapped[float] = mapped_column(nullable=False)
