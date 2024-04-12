from . import db
from typing import Optional
from .Profile import Profile
from dataclasses import dataclass
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship

@dataclass
class Solar(db.Model):
    """
    Solar panel calculation result cache
    required attr:
        id: self id
        time: hourly timestamp
        value: float, power-generated.
        # parameters the calculation was called with.
        lon: float
        lat: float
        tech: String, see proof-of-concept/solar.py
        loss: float，内损
        power: float, 装机发电量（瓦特）
    """
    id: Mapped[int] = mapped_column(primary_key=True)
    profile: Mapped[Optional[Profile]] = relationship(back_populates="solar")
    time: Mapped[datetime] = mapped_column()
    value: Mapped[float] = mapped_column()

    lon: Mapped[float] = mapped_column()
    lat: Mapped[float] = mapped_column()
    amount: Mapped[float] = mapped_column()
    size: Mapped[int] = mapped_column()
    tech: Mapped[int] = mapped_column()  # use Integer to represent different techs
    loss: Mapped[float] = mapped_column()
    power: Mapped[float] = mapped_column()
