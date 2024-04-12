from . import db
from typing import Optional
from .Profile import Profile
from dataclasses import dataclass
from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship


@dataclass
class Usage(db.Model):
    """
    Business usage profile
    required attr:
        id:
        p_id: id to identify which profile this usage belong to
            (up to your discretion, tell me after you've decided)
        time: hourly timestamp (use appropriate format, please tell me after you've decided)
        usage: ...kWh
    """

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("profile.id"))
    profile: Mapped[Profile] = relationship(back_populates="usage")
    time: Mapped[datetime] = mapped_column()
    usage: Mapped[float] = mapped_column()
    publicize: Mapped[bool] = mapped_column(default=False)

    def __repr__(self):
        return f"Usage('{self.p_id}','{self.time}','{self.usage}'"
