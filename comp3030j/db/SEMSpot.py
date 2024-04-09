from . import db


class SEMSpot(db.Model):
    """
    Single Electricity Market Spot Profile
    required attr:
        time: hourly timestamp (use appropriate format, please tell me after you've decided)
        spot: price in EUR/MWh
    @陈嘉文 please write this
    """

    def __repr__(self):
        return f"SEMSpot('{self.time}','{self.spot}'"
