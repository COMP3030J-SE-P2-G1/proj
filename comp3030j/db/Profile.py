from . import db
from typing import Optional, List
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy_utc import UtcDateTime
from datetime import datetime


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

    lon: Mapped[float] = mapped_column()
    lat: Mapped[float] = mapped_column()
    tech: Mapped[int] = mapped_column()

    loss: Mapped[float] = mapped_column()
    power: Mapped[float] = mapped_column()  # kW
