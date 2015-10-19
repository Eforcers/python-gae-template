#-*- coding: utf-8 -*-
# vim: set fileencoding=utf-8
"""
settings.py

Configuration for Flask app

Important: Place your keys in the secret_keys.py module, 
           which should be kept out of version control.

"""
import logging
import os
import urllib

from secret_keys import CSRF_SECRET_KEY, SESSION_KEY


class Config(object):
    """
    Default configuration
    """
    #Production is the
    ENV_PRODUCTION = 'PRODUCTION'
    #Staging is used for testing replicating the same production environment
    ENV_STAGING = 'STAGING'
    #Done sessions cant be modified
    ENV_LOCAL = 'LOCAL'
    ENVIRONMENT_CHOICES = [
        ENV_PRODUCTION,
        ENV_STAGING,
        ENV_LOCAL,
    ]
    DEBUG = False
    TESTING = False
    STAGING = False
    PRODUCTION = False
    CSRF_ENABLED = True

    # Set secret keys for CSRF protection
    SECRET_KEY = CSRF_SECRET_KEY
    CSRF_SESSION_KEY = SESSION_KEY
    OAUTH2_SCOPE = ""
    EMAIL_REGEXP = "^[a-zA-Z0-9'._-]+@[a-zA-Z0-9._-]+.[a-zA-Z]{2,6}$"

class ProductionConfig(Config):
    """
    Overrides the default configuration
    """
    DEBUG = False
    TESTING = False
    STAGING = False
    PRODUCTION = True
    CSRF_ENABLED = True


class TestingConfig(Config):
    """
    Configuration used for development and testing
    """
    DEBUG = False
    TESTING = True
    PRODUCTION = False
    CSRF_ENABLED = False


class DevelopmentConfig(TestingConfig):
    """
    Configuration used for local development
    """
    DEFAULT_SERVER_NAME = 'localhost:8080'
    CUSTOM_SERVER_NAME = 'localhost:8080'


def get_setting(key):
    """
    Get the value for a setting with the given key, since cache is shared
    between staging and production is necessary to include that in the key too
    :param key: string that represents the setting key
    :return: the value of the setting
    """
    try:
        from main import flask_app
        return flask_app.config[key]
    except:
        environment = get_environment()
        #Load settings from the corresponding class
        if environment == Config.ENV_PRODUCTION:
            obj = ProductionConfig()
        else:
            obj = TestingConfig()
        return getattr(obj, key)


def get_environment():
    """
    Returns the environment based on the OS variable, server name and app id
    :return: The current environment that the app is running on
    """
    # Auto-set settings object based on App Engine dev environ
    if 'SERVER_SOFTWARE' in os.environ:
        if os.environ['SERVER_SOFTWARE'].startswith('Dev'):
            return Config.ENV_LOCAL
        elif os.environ['SERVER_SOFTWARE'].startswith('Google App Engine/'):
            #For considering an environment staging we assume the version id
            # contains -staging and the URL
            current_version_id = str(os.environ['CURRENT_VERSION_ID']) if (
                'CURRENT_VERSION_ID') in os.environ else ''
            if '-staging' in current_version_id:
                return Config.ENV_STAGING
            #If not local or staging then is production TODO: really?
            return Config.ENV_PRODUCTION
    return Config.ENV_LOCAL


def get_raw_server_name():
    """
    The raw server name is GAE generated by default, it's meant for a
    specific version of an app. The version ID is taken from OS variable and
    the ID from the identity API
    :return: URL in the form version.appid.appspot.com
    """
    from google.appengine.api import app_identity
    return '%s.%s.appspot.com' % (os.environ[
        'CURRENT_VERSION_ID'].split('.')[0], app_identity.get_application_id())


def get_url():
    """Returns the URL of the page currently being served.

    Returns:
      The full URL of the page currently being served.
    """
    if os.environ['SERVER_PORT'] == '80':
      scheme = 'http://'
    else:
      scheme = 'https://'
    host = os.environ['SERVER_NAME']
    script_name = urllib.quote(os.environ.get('SCRIPT_NAME', ''))
    path_info = urllib.quote(os.environ.get('PATH_INFO', ''))
    qs = os.environ.get('QUERY_STRING', '')
    if qs:
      qs = '?' + qs
    return scheme + host + script_name + path_info + qs