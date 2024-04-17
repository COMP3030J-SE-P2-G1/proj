from . import db
from .Profile import Profile
from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy_utc import UtcDateTime


class Usage(db.Model, SerializerMixin):
    """
    Business usage profile
    """

    # Exclude ORM relationships
    serialize_rules = ("-profile",)
    datetime_format = "%Y-%m-%dT%H:%M:%SZ"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("profile.id"))
    profile: Mapped[Profile] = relationship(back_populates="usage")
    time: Mapped[datetime] = mapped_column(UtcDateTime())
    usage: Mapped[float] = mapped_column()
    publicize: Mapped[bool] = mapped_column(default=False)
