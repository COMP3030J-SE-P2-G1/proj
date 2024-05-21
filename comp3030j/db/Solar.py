from . import db
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy_utc import UtcDateTime
from sqlalchemy import Numeric


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
    lon: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False))
    lat: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False))
    tech: Mapped[int] = mapped_column()  # use Integer to represent different techs
    loss: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False))
    power: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False))
    time: Mapped[datetime] = mapped_column(UtcDateTime())
    generation: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False))

    def to_timeseries(self):
        return self.generation
