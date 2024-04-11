from . import db
from dataclasses import dataclass
from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

@dataclass
class SEMSpot(db.Model):
    """
    Single Electricity Market Spot Profile
    required attr:
        time: hourly timestamp (use appropriate format, please tell me after you've decided)
        spot: price in EUR/MWh
    """

    __tablename__ = "sems"
    time: Mapped[datetime] = mapped_column(primary_key=True)
    spot: Mapped[float] = mapped_column(nullable=False)

    def __repr__(self):
        return f"SEMSpot('{self.time}','{self.spot}')"
