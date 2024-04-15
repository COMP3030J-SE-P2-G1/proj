from . import db
from typing import Optional, List
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy_serializer import SerializerMixin


class Profile(db.Model, SerializerMixin):
    """
    Business usage profile
    required attr:
        id:
        usage_id: id of the usage profile
        solar_id: id of the solar panel configuration
        desc: short description?
    """

    # Exclude ORM relationships
    serialize_rules = ("-user", "-usage", "-solar")

    __tablename__ = "profile"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    user: Mapped["User"] = relationship(back_populates="profiles")
    name: Mapped[str]
    desc: Mapped[Optional[str]]
    usage: Mapped[List["Usage"]] = relationship(back_populates="profile")

    lon: Mapped[float] = mapped_column()
    lat: Mapped[float] = mapped_column()
    tech: Mapped[int] = mapped_column()  # use Integer to represent different techs
    loss: Mapped[float] = mapped_column()
    power: Mapped[float] = mapped_column()
