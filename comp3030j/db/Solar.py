from . import db


class Solar(db.Model):
    """
    Solar panel calculation result cache
    required attr:
        id: self id
        time: hourly timestamp
        value: float, power-generated.
        # parameters the calculation was called with.
        lon: float
        lat: float
        tech: String, see proof-of-concept/solar.py
        loss: float，内损
        power: float, 装机发电量（瓦特）
    """
    __tablename__ = 'solar'
    id = db.Column(db.Integer, primary_key=True)
    u_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, default=0)
    time = db.Column(db.DateTime, nullable=False)
    value = db.Column(db.Float, nullable=False)

    lon = db.Column(db.Float, nullable=False)
    lat = db.Column(db.Float, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    size = db.Column(db.Integer, nullable=False)
    tech = db.Column(db.Integer, nullable=False)  # use Integer to represent different techs
    loss = db.Column(db.Float, nullable=False)
    power = db.Column(db.Float, nullable=False)
