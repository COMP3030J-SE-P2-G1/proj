from . import db
from .Profile import Profile
from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy_utc import UtcDateTime
from sqlalchemy import Float


class Solar(db.Model, SerializerMixin):
    """
    Solar panel calculation result cache
    required attr:
        id: self id
        time: hourly timestamp
        generation: float, power-generated. kWh.
        # parameters the calculation was called with.
        lon: float
        lat: float
        tech: String, see proof-of-concept/solar.py
        loss: float
        power: float, KW
    """

    datetime_format = "%Y-%m-%dT%H:%M:%S.%fZ"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    lon: Mapped[float] = mapped_column(Float(10, 2))
    lat: Mapped[float] = mapped_column(Float(10, 2))
    tech: Mapped[int] = mapped_column()  # use Integer to represent different techs
    loss: Mapped[float] = mapped_column(Float(10, 2))
    power: Mapped[float] = mapped_column(Float(10, 2))
    time: Mapped[datetime] = mapped_column(UtcDateTime())
    generation: Mapped[float] = mapped_column(Float(10, 2))

    def to_timeseries(self):
        return self.generation
