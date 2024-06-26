from flask_wtf import FlaskForm
from wtforms import StringField, ValidationError, FloatField, DateField, SelectField
from flask_wtf.file import MultipleFileField, FileAllowed, FileRequired
from wtforms.validators import DataRequired, Length
from comp3030j.util import _ltr


class ProfileForm(FlaskForm):
    name = StringField(_ltr('Name'), validators=[DataRequired(), Length(min=2, max=20)])
    desc = StringField(_ltr('Description(Optional)'), validators=[Length(max=50)])
    start_time = DateField(_ltr('Start Time'), validators=[DataRequired()])
    end_time = DateField(_ltr('End Time'), validators=[DataRequired()])
    lon = FloatField(_ltr('Longitude'), validators=[DataRequired()])
    lat = FloatField(_ltr('Latitude'), validators=[DataRequired()])
    tech = SelectField(_ltr('Technology'), choices=[('1', 'crystSi'), ('2', 'CIS'), ('3', 'CdTe')])
    loss = FloatField(_ltr('Loss'), validators=[DataRequired()])
    power = FloatField(_ltr('Power - kW'), validators=[DataRequired()])
    usage_file = MultipleFileField(_ltr('Usage - UTC+1(No DST)'),
                                   validators=[FileRequired(), FileAllowed(['csv'], _ltr('csv only!'))])

    def validate_end_time(self, end_time):
        if end_time.data < self.start_time.data:
            raise ValidationError(_ltr('End time should be later than start time.'))

    def validate_lon(self, lon):
        if lon.data < -180 or lon.data > 180:
            raise ValidationError(_ltr('Longitude should be between -180 and 180.'))

    def validate_lat(self, lat):
        if lat.data < -90 or lat.data > 90:
            raise ValidationError(_ltr('Latitude should be between -90 and 90.'))

    def validate_tech(self, tech):
        if tech.data is None:
            raise ValidationError(_ltr('Please choose a technology of solar panel.'))
        elif int(tech.data) > 2 or int(tech.data) < 0:
            raise ValidationError(_ltr('Technology should be a positive integer.'))

    def validate_loss(self, loss):
        if loss.data < 0 or loss.data > 1:
            raise ValidationError(_ltr('Loss should be a positive float which is less than 1.'))

    def validate_power(self, power):
        if power.data < 0:
            raise ValidationError(_ltr('Power should be a positive float.'))
