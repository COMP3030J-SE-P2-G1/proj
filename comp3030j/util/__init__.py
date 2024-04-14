import os

from flask_babel import gettext as _tr, ngettext as _ntr, lazy_gettext as _ltr

from comp3030j import app


# __all__=['_tr', '_ntr', '_ltr']

def allowed_img(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg'}


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'csv', 'xlsx', 'xls'}


def save_file(file, path, file_name):
    file.save(os.path.join(app.root_path, path, file_name))


def delete_file(path, file_name):
    try:
        os.remove(os.path.join(app.root_path, path, file_name))
    except FileNotFoundError:
        pass

