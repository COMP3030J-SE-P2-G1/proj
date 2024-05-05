from . import db
from .Profile import Profile
from .apikey import ApiKey
from typing import List
from comp3030j.extensions import login_manager
from flask_login import UserMixin
from dataclasses import dataclass
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy_serializer import SerializerMixin


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@dataclass
class User(db.Model, UserMixin, SerializerMixin):
    __tablename__ = "user"

    # Exclude ORM relationships
    serialize_rules = ("-profiles",)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(unique=True)
    email: Mapped[str] = mapped_column()
    password: Mapped[str] = mapped_column()
    avatar_file: Mapped[str] = mapped_column(default="default.jpg")
    profiles: Mapped[List[Profile]] = relationship(back_populates="user")
    apikeys: Mapped[List[ApiKey]] = relationship(back_populates="user")
    
    @classmethod
    def find_by_id(cls, id: str):
        return User.query.filter_by(id=id).first()
    

