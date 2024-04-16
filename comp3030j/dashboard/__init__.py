from flask_wtf import FlaskForm
from wtforms import StringField, ValidationError, FloatField, DateTimeField, IntegerField
from flask_wtf.file import MultipleFileField, FileAllowed, FileRequired
from wtforms.validators import DataRequired, Length
from comp3030j.util import _ltr


class ProfileForm(FlaskForm):
    name = StringField(_ltr('Name'), validators=[DataRequired(), Length(min=2, max=20)])
    desc = StringField(_ltr('Description'), validators=[Length(max=50)])
    start_time = DateTimeField(_ltr('Start Time'), validators=[DataRequired()])
    end_time = DateTimeField(_ltr('End Time'), validators=[DataRequired()])
    lon = FloatField(_ltr('Longitude'), validators=[DataRequired()])
    lat = FloatField(_ltr('Latitude'), validators=[DataRequired()])
    tech = IntegerField(_ltr('Technology'), validators=[DataRequired()])
    loss = FloatField(_ltr('Loss'), validators=[DataRequired()])
    power = FloatField(_ltr('Power'), validators=[DataRequired()])
    generation = FloatField(_ltr('Generation'), validators=[DataRequired()])
    usage_file = MultipleFileField(_ltr('Usage'), validators=[FileRequired(), FileAllowed(['csv'], _ltr('csv only!'))])

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
            raise ValidationError(_ltr('Please choose a Technology.'))
        elif tech.data > 2 or tech.data < 0:
            raise ValidationError(_ltr('Technology should be a positive integer.'))

    def validate_loss(self, loss):
        if loss.data < 0:
            raise ValidationError(_ltr('Loss should be a positive float.'))
        elif loss.data > 1:
            raise ValidationError(_ltr('Loss should be less than 1.'))

    def validate_power(self, power):
        if power.data < 0:
            raise ValidationError(_ltr('Power should be a positive float.'))

    def validate_generation(self, generation):
        if generation.data < 0:
            raise ValidationError(_ltr('Generation should be a positive float.'))
