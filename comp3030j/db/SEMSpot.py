from . import db


class SEMSpot(db.Model):
    """
    Single Electricity Market Spot Profile
    required attr:
        time: hourly timestamp (use appropriate format, please tell me after you've decided)
        spot: price in EUR/MWh
    """

    time = db.Column(db.DateTime, primary_key=True)
    spot = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f"SEMSpot('{self.time}','{self.spot}'"
