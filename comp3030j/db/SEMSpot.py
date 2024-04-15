from . import db

from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy_serializer import SerializerMixin


class SEMSpot(db.Model, SerializerMixin):
    """
    Single Electricity Market Spot Profile
    required attr:
        time: hourly timestamp
        spot: price in EUR/MWh
    """

    __tablename__ = "sems"
    time: Mapped[datetime] = mapped_column(primary_key=True)
    spot: Mapped[float] = mapped_column(nullable=False)
