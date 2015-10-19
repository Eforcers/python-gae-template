# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8

from google.appengine.api import users

from flask import current_app as app
from flask import redirect, request, abort, g
from flask.helpers import url_for
from models import User
import constants


@app.route('/')
def index():
    user = users.get_current_user()
    if user:
        if User.is_domain_authorized(user.email()):
            #For now only admins can access the platform, so just redirect
            return redirect(url_for('admin_index'))
        abort(403)
    #Force user to login then admin
    return redirect(users.create_login_url(url_for('admin_index')))


@app.before_request
def before_request():
    if request.path == url_for('warmup'):
        return
    user = users.get_current_user()
    if user:
        g.logout_text = 'Salir'
        g.url_logout = users.create_logout_url(url_for('admin_index'))
        g.user_email = user.email()
    else:
        g.logout_text = 'Iniciar sesión'
        g.url_logout = users.create_login_url(url_for('admin_index'))
        g.user_email = None
    g.menu = []
    for endpoint, name, allowed_roles in constants.MENU_ITEMS:
        user_allowed = User.has_profile(g.user_email, allowed_roles)
        if user_allowed:
            g.menu.append({
                'is_active': request.path == url_for(endpoint),
                'url': url_for(endpoint),
                'name': name,
            })


@app.route('/_ah/warmup')
def warmup():
    """
    App Engine warmup handler. See http://code.google.com/appengine/docs/python/config/appconfig.html#Warming_Requests
    """
    return ''