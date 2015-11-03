"""
`appengine_config.py` is automatically loaded when Google App Engine
starts a new instance of your application. This runs before any
WSGI applications specified in app.yaml are loaded.
"""

from google.appengine.ext import vendor

# Third-party libraries are stored in "lib", vendoring will make
# sure that they are importable by the application.
vendor.add('lib')


import os
import re

regex = re.compile(r'^/?a/(?P<domain>(?:[\w](?:[\w-]{0,61}[\w])?\.)+(?:[A-Za-z]{2,6}\.?|[\w-]{2,}\.?))/')

# Profile costs with appstats
#appstats_CALC_RPC_COSTS = True

def namespace_manager_default_namespace_for_request():
    name = None
    path = os.environ.get('PATH_INFO', '')
    match = regex.match(path)
    if match:
        name = match.groupdict()['domain']
    return name