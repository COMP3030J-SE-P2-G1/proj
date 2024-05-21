from . import db
from typing import Optional, List
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy_utc import UtcDateTime
from datetime import datetime
from sqlalchemy import Numeric
from typing import Union


class Profile(db.Model, SerializerMixin):
    """
    Business usage profile
    required attr:
        id:
        usage_id: id of the usage profile
        solar_id: id of the solar panel configuration
        desc: short description?
    """

    __tablename__ = "profile"

    # Exclude ORM relationships
    serialize_rules = ("-user", "-usage", "-solar")
    datetime_format = "%Y-%m-%dT%H:%M:%S.%fZ"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    user: Mapped["User"] = relationship(back_populates="profiles")
    name: Mapped[str]
    desc: Mapped[Optional[str]]
    usage: Mapped[List["Usage"]] = relationship(back_populates="profile")

    start_time: Mapped[datetime] = mapped_column(UtcDateTime())
    end_time: Mapped[datetime] = mapped_column(UtcDateTime())

    lon: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False))
    lat: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False))
    tech: Mapped[int] = mapped_column()

    loss: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False))
    power: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False))  # kW

    def __init__(
            self,
            user_id: int,
            name: str,
            desc: Union[str, None],
            start_time: datetime,
            end_time: datetime,
            lon: float,
            lat: float,
            tech: int,
            loss: float,
            power: float
    ):
        self.user_id = user_id
        self.name = name
        self.desc = desc
        self.start_time = start_time
        self.end_time = end_time
        self.lon = lon
        self.lat = lat
        self.tech = tech
        self.loss = loss
        self.power = power
