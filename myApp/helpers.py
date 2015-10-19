#-*- coding: utf-8 -*-
# vim: set fileencoding=utf-8
import random

from xml.dom.minidom import Document, Element
import xml.etree.ElementTree as ET
import time
from apiclient.http import MediaFileUpload
import constants

from oauth2client.client import OAuth2WebServerFlow
from oauth2client.client import Credentials
from apiclient.discovery import build
from settings import get_setting
import logging


logging.getLogger().setLevel(logging.INFO)
import httplib2


class OAuthDanceHelper:
    """ OAuth dance helper class"""
    flow = None

    def __init__(self, redirect_uri='', approval_prompt='auto', scope=''):
        self.flow = OAuth2WebServerFlow(
            client_id=get_setting('OAUTH2_CLIENT_ID'),
            client_secret=get_setting(
                'OAUTH2_CLIENT_SECRET'),
            scope=scope,
            redirect_uri=redirect_uri,
            approval_prompt=approval_prompt)

    def step1_get_authorize_url(self):
        return self.flow.step1_get_authorize_url()

    def step2_exchange(self, code):
        return self.flow.step2_exchange(code)

    def get_credentials(self, credentials_json):
        return Credentials.new_from_json(credentials_json)


class OAuthServiceHelper:
    """ OAuth services base helper class"""
    credentials = None
    service = None

    def __init__(self, credentials_json, refresh_token=None):
        oOAuthHelper = OAuthDanceHelper()
        self.credentials = oOAuthHelper.get_credentials(credentials_json)
        if refresh_token and self.credentials.refresh_token is None:
            self.credentials.refresh_token = refresh_token
        self.http = self.credentials.authorize(httplib2.Http())