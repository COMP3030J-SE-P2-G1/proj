from . import db


class Usage(db.Model):
    """
    Business usage profiel
    required attr:
        id:
        p_id: id to identify whic profile this usage belong to
            (up to your discretoin, tell me after you've decided)
        time: hourly timestamp (use appropriate format, please tell me after you've decided)
        usage: ...kWh
    @陈嘉文 please write this
    """

    def __repr__(self):
        return f"Usage('{self.p_id}','{self.time}','{self.usage}'"
