"""`main` is the top level module for your Flask application."""

# Import the Flask Framework
from flask import Flask
from google.appengine.ext import endpoints
from settings import get_environment, Config, ProductionConfig, TestingConfig, \
    DevelopmentConfig
from werkzeug.debug import DebuggedApplication


flask_app = Flask(__name__)
with flask_app.app_context():
    environment = get_environment()
    #Load settings from the corresponding class
    if environment == Config.ENV_PRODUCTION:
        flask_app.config.from_object(ProductionConfig)
    elif environment == Config.ENV_LOCAL:
        flask_app.config.from_object(DevelopmentConfig)
    elif environment == Config.ENV_STAGING:
        flask_app.config.from_object(TestingConfig)
        #Compute staging server name for URL generation
        from settings import get_raw_server_name
        #FIXME: should be captured from the Flask request, not built manually
        server_name = get_raw_server_name()
        flask_app.config['DEFAULT_SERVER_NAME'] = server_name
        flask_app.config['CUSTOM_SERVER_NAME'] = server_name

    #If debug then enable
    if flask_app.config['DEBUG']:
        flask_app.debug = True
        app = DebuggedApplication(flask_app, evalex=True)

    flask_app.jinja_env.add_extension('jinja2.ext.loopcontrols')
    flask_app.jinja_env.add_extension('jinja2.ext.autoescape')
    flask_app.jinja_env.autoescape=True
    from myApp.filters import has_profile
    flask_app.jinja_env.filters['has_profile'] = has_profile

    from google.appengine.ext.appstats import recording
    app = recording.appstats_wsgi_middleware(flask_app)

    from google.appengine.ext.deferred import application as deferred_app
    deferred_app = recording.appstats_wsgi_middleware(deferred_app)

    from myApp.apis import UserApi, TaskApi
    api = recording.appstats_wsgi_middleware(
        endpoints.api_server([UserApi, TaskApi], restricted=False,))

    from myApp import admin_views
    from myApp import views


