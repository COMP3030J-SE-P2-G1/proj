from . import db
from typing import Optional, List
from dataclasses import dataclass
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

@dataclass
class Profile(db.Model):
    """
    Business usage profile
    required attr:
        id:
        u_id: id to identify the owner
        usage_id: id of the usage profile
        solar_id: id of the solar panel configuration
        desc: short description?
    """
    
    __tablename__ = 'profile'
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    u_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    user: Mapped["User"] = relationship(back_populates="profiles")
    name: Mapped[str]
    desc: Mapped[Optional[str]]
    usage: Mapped[List["Usage"]] = relationship(back_populates="profile")
    solar: Mapped[List["Solar"]] = relationship(back_populates="profile")

    def __repr__(self):
        return f"Profile('{self.u_id}', '{self.usage_id}', '{self.solar_id}','{self.desc}')"
