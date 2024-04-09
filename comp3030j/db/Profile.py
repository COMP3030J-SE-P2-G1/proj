from . import db
from enum import Enum


class Elect_Generate(Enum):
    ACTIVE = 'Crystalline PV cells'
    INACTIVE = 'Non-crystalline PV cells'
    INACTIVE = 'Hetero junction cells'


class Profile(db.Model):
    """
    Business usage profile
    required attr:
        id:
        u_id: id to identify the owner?
        p_id: id of the owned profile?
        desc: short description?
    @陈嘉文 please write this
    """
    __tablename__ = 'profile'
    id = db.Column(db.Integer, primary_key=True)
    u_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    size = db.Column(db.Integer, nullable=False)
    generate_way = db.Column(db.Enum(Elect_Generate), default=Elect_Generate.ACTIVE)
    desc = db.Column(db.String)

    def __repr__(self):
        return f"Profile('{self.u_id}','{self.longitude}','{self.latitude}','{self.amount}','{self.size}','{self.generate_way}','{self.desc}')"
