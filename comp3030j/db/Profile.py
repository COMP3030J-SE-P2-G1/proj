from . import db


class Profile(db.Model):
    """
    Business usage profile
    required attr:
        id:
        u_id: id to identify the owner
        usage_id: id of the usage profile
        solar_id: id of the solar panel configuration
        desc: short description?
    @陈嘉文 please write this
    """
    __tablename__ = 'profile'
    id = db.Column(db.Integer, primary_key=True)
    u_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    usage_id = db.Column(db.Integer, db.ForeignKey("usage.id"), nullable=False)
    solar_id = db.Column(db.Integer, db.ForeignKey("solar.id"), nullable=False)
    desc = db.Column(db.String)

    def __repr__(self):
        return f"Profile('{self.u_id}','{self.longitude}','{self.latitude}','{self.amount}','{self.size}','{self.generate_way}','{self.desc}')"
