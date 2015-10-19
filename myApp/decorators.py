"""
decorators.py

Decorators for URL handlers

"""

from functools import wraps
import logging

from google.appengine.api import users
import endpoints

from flask import redirect, request, abort
from models import User

IS_TEST = False
UNAUTHORIZED_USER = 'UNAUTHORIZED_USER'

def role_required(role=None, roles=None):
    def decorator(func):
        @wraps(func)
        def inner_decorator(*args, **kwargs):
            if(IS_TEST):
                return func(*args, **kwargs)

            roles_to_evaludate = [role] if role else roles if roles else []

            logging.info("roles to evaluate [%s]", roles_to_evaludate)
            user_email = args[1].get_unrecognized_field_info(
                'authenticated_user'
            )[0]

            if not user_email:
                if hasattr(args[1],'authenticated_user'):
                    user_email = args[1].authenticated_user

            logging.info("user to evaluate [%s]", user_email)

            if user_email and User.has_profile(user_email, roles_to_evaludate):
                return func(*args, **kwargs)
            else:
                raise endpoints.ForbiddenException(UNAUTHORIZED_USER)
        return inner_decorator
    return decorator


def login_required(func):
    """Requires standard login credentials"""
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if not users.get_current_user():
            return redirect(users.create_login_url(request.url))
        return func(*args, **kwargs)
    return decorated_view


def admin_required(func):
    """Requires domain admin (a.k.a staff) credentials"""
    @wraps(func)
    def decorated_view(*args, **kwargs):
        current_user = users.get_current_user()
        if current_user:
            user = User.get_by_email(current_user.email())
            if not user or not user.is_staff:
                abort(403)  # Unauthorized
            return func(*args, **kwargs)
        return redirect(users.create_login_url(request.url))
    return decorated_view


def super_admin_required(func):
    """Requires App Engine admin credentials"""
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if users.get_current_user():
            if not users.is_current_user_admin():
                abort(403)  # Unauthorized
            return func(*args, **kwargs)
        return redirect(users.create_login_url(request.url))
    return decorated_view


def profiles_with_access(profiles=[]):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            gae_user = users.get_current_user()
            if not gae_user:
                abort(403)
            user = User.get_by_email(gae_user.email())
            if not user:
                abort(403)
            user_profiles = (
                user.profiles if user else []
            )
            for p in profiles:
                if p in user_profiles:
                    break
            else:
                abort(403)
            return f(*args, **kwargs)
        return decorated_function
    return decorator
