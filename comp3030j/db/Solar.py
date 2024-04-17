from . import db
from .Profile import Profile
from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy_utc import UtcDateTime


class Solar(db.Model, SerializerMixin):
    """
    Solar panel calculation result cache
    required attr:
        id: self id
        time: hourly timestamp
        generation: float, power-generated.
        # parameters the calculation was called with.
        lon: float
        lat: float
        tech: String, see proof-of-concept/solar.py
        loss: float，内损
        power: float, 装机发电量（瓦特）
    """

    datetime_format = "%Y-%m-%dT%H:%M:%SZ"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    lon: Mapped[float] = mapped_column()
    lat: Mapped[float] = mapped_column()
    tech: Mapped[int] = mapped_column()  # use Integer to represent different techs
    loss: Mapped[float] = mapped_column()
    power: Mapped[float] = mapped_column()
    time: Mapped[datetime] = mapped_column(UtcDateTime())
    generation: Mapped[float] = mapped_column()
