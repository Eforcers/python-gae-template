# -*- coding: utf-8 -*-

import logging
from flask.templating import render_template
from google.appengine.api import memcache
from flask import redirect, helpers, request
from models import Client
from helpers import OAuthDanceHelper
from settings import get_setting
from flask import current_app as app, abort
from decorators import profiles_with_access, login_required

@app.route('/admin/')
@login_required
def admin_index():
    return render_template('admin_index.html')

@app.route('/admin/clean/cache')
@app.route('/clean/cache')
def clean_cache():
    memcache.flush_all()
    return 'cache was cleaned'

@app.route('/admin/settings/')
@profiles_with_access(['ADMIN'])
def settings():
    return "Admin View"

@app.route('/admin/oauth/start/')
def start_oauth2_dance():
    login_hint = ''
    scope = ''
    client = Client.get_by_id(1)
    if not client:
        #If client does not exist then create an empty one
        client = Client(id=1)
        client.put()
    #Get the login hint from configuration

    # approval_prompt = 'auto' if client.reseller_refresh_token else 'force'
    # Always force to be sure to get valid refresh token
    approval_prompt = 'force'
    login_hint = get_setting('OAUTH2_RESELLER_DOMAIN_USER')
    scope = get_setting('OAUTH2_SCOPE')
    redirect_uri = helpers.url_for('oauth_callback', _external=True)
    oauth_helper = OAuthDanceHelper(scope=scope, redirect_uri=redirect_uri,
                                    approval_prompt=approval_prompt)
    url = oauth_helper.step1_get_authorize_url()
    #TODO: Add a random token to avoid forgery
    return redirect("%s&login_hint=%s" % (url, login_hint))


@app.route('/admin/oauth/callback/')
def oauth_callback():
    code = request.args.get('code', None)
    if not code:
        logging.error('No code, no authorization')
        abort(500)
    redirect_uri = helpers.url_for('oauth_callback', _external=True)
    oauth_helper = OAuthDanceHelper(redirect_uri=redirect_uri)
    credentials = oauth_helper.step2_exchange(code)
    client = Client.get_by_id(1)
    if not client:
        logging.error('No client object, aborting authorization')
        abort(500)
    client.credentials = credentials.to_json()
    if credentials.refresh_token:
        client.refresh_token = credentials.refresh_token
    client.put()

    return redirect(helpers.url_for('settings'))