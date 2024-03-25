from flask_babel import gettext as _tr, ngettext as _ntr, lazy_gettext as _ltr


# __all__=['_tr', '_ntr', '_ltr']

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg'}
