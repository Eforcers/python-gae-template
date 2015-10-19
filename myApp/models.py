#-*- coding: utf-8 -*-
# vim: set fileencoding=utf-8
from google.appengine.ext import ndb, endpoints
import re
from google.appengine.api.datastore_errors import BadValueError
from settings import get_setting
import logging
from google.appengine.api import memcache
import constants
from endpoints_proto_datastore.ndb.model import (EndpointsModel,
                                                 EndpointsAliasProperty)

def validate_email(property, value):
    value = value if value else None
    if value is None:
        return value
    elif value[0] == u'\ufffd':
        return value[1:].lower()
    elif not re.match(get_setting('EMAIL_REGEXP'), value):
        raise BadValueError
    return value.lower()

def validate_name(property, value):
    """
    Validate the name
    :param property:
    :param value: value should be encoded in UTF8
    :return:
    """
    if value is None:
        return value
    if len(value) > 60:
        raise BadValueError
    #Value should be title cased
    if isinstance(value, str):
        return value.decode('utf-8').title().strip()
    elif isinstance(value, unicode):
        return value.title().strip()
    else:
        logging.error('Not a string [%s]', value)
        raise BadValueError



class Client(ndb.Model):
    """
    Datastore entity for storing global configuration like (OAuth2.0 credentials
    and other settings)
    """
    credentials = ndb.TextProperty(indexed=False)
    refresh_token = ndb.StringProperty(indexed=False)


class User(EndpointsModel):
    email = ndb.StringProperty(required=True, validator=validate_email)
    #givenName
    first_name = ndb.StringProperty(indexed=False, validator=validate_name)
    #familyName
    last_name = ndb.StringProperty(indexed=False, validator=validate_name)
    profiles = ndb.StringProperty(repeated=True, choices=constants.PROFILES.keys())
    is_staff = ndb.BooleanProperty(default=False)

    @staticmethod
    def has_profile(email, allowed_profiles):
        """
        Check that the user has one of the given profiles
        """
        if not email or not allowed_profiles:
            return False
        #Because of the combination of projection and repeated properties
        # multiple users may be returned
        user_profiles = memcache.get('user-profile-%s' % email)
        if not user_profiles:
            user_profiles = list()
            users = User.query(User.email == email.lower()).fetch()
            #TODO: There should be a more efficient way
            for user in users:
                user_profiles.extend(user.profiles)

            user_profiles = list(set(user_profiles))

            memcache.set("user-profile-%s" % email, user_profiles)

        for allowed_profile in allowed_profiles:
            if allowed_profile in user_profiles:
                return True

        return False