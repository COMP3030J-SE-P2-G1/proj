from . import db


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

    __tablename__ = "usage"
    id = db.Column(db.Integer, primary_key=True)
    p_id = db.Column(db.Integer, db.ForeignKey("profile.id"), nullable=False, default=0)
    time = db.Column(db.DateTime, nullable=False)
    usage = db.Column(db.Float, nullable=False)

    publicize = db.Column(db.Boolean, nullable=False, default=False)

    def __repr__(self):
        return f"Usage('{self.p_id}','{self.time}','{self.usage}'"
