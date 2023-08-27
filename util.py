from functools import wraps
from flask import jsonify
from flask import session, redirect


def json_response(func):
    """
    Converts the returned dictionary into a JSON response
    :param func:
    :return:
    """
    @wraps(func)
    def decorated_function(*args, **kwargs):
        return jsonify(func(*args, **kwargs))

    return decorated_function


def is_logged_in(function):
    @wraps(function)
    def is_logged_wrapper(*args, **kwargs):
        if "is_logged" in session and session["is_logged"]:
            return function(*args, **kwargs)
        else:
            return redirect("/api/v1/login")
    return is_logged_wrapper