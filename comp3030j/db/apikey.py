from . import db
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy_serializer import SerializerMixin
from uuid import uuid4


class ApiKey(db.Model, SerializerMixin):
    __tablename__ = "api_key"

    # Exclude ORM relationships
    serialize_rules = ("-id", "-user",)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    user: Mapped["User"] = relationship(back_populates="apikeys")
    token: Mapped[str] = mapped_column(unique=True, index=True)
    desc: Mapped[str] = mapped_column(nullable=True)

    def __init__(self, user_id, desc = None, token=None):
        self.user_id = user_id
        self.token = token or uuid4().hex
        self.desc = desc

    @classmethod
    def find_by_token(cls, token: str):
        return cls.query.filter_by(token=token).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

