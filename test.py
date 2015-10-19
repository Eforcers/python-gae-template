import os
import sys
import argparse
import unittest

os.environ['CURRENT_VERSION_ID'] = 'test.1'
parser = argparse.ArgumentParser()
parser.add_argument("--gui", help="Run the UI tests",
                    action="store_true")
parser.add_argument("--unit", help="Run the unit tests",
                    action="store_true")
parser.add_argument("--integration", help="Run the integration tests",
                    action="store_true")
args = parser.parse_known_args()

TEST_GUI = True if args[0].gui else False
TEST_UNIT = True if args[0].unit else False
TEST_INTEGRATION = True if args[0].integration else False

APP_ENGINE_SDK_WINDOWS = 'C:\Program Files (x86)\Google\google_appengine'
APP_ENGINE_SDK_MAC = '/usr/local/google_appengine'
APP_ENGINE_SDK_LINUX = './google_appengine'

LIBS = ['yaml-3.10',
        'protorpc-1.0',
        'simplejson',
        'antlr3',
        'fancy_urllib',
        'ipaddr',
        'jinja2-2.6',
        'webob-1.2.3',
        'endpoints-1.0',
        'webapp2-2.3',
        ]

if sys.platform == 'darwin':
    APP_ENGINE_SDK = APP_ENGINE_SDK_MAC
elif sys.platform == 'linux2':
    APP_ENGINE_SDK = APP_ENGINE_SDK_LINUX
else:
    APP_ENGINE_SDK = APP_ENGINE_SDK_WINDOWS

app = None
sys.path.insert(1, APP_ENGINE_SDK)
sys.path.insert(2, os.path.join(os.path.dirname(__file__), 'lib'))
sys.path.insert(3, os.path.join(os.path.dirname(__file__), 'myApp'))
for LIB in LIBS:
    sys.path.append(os.path.join(APP_ENGINE_SDK, 'lib', LIB))

if TEST_UNIT or TEST_INTEGRATION:
    #from google.appengine.tools import dev_appserver
    #from google.appengine.tools.dev_appserver_main import ParseArguments

    # Otherwise the option_dict isn't populated.
    #args, option_dict = ParseArguments([])

    #dev_appserver.SetupStubs('local', **option_dict)
    os.environ['SERVER_NAME'] = 'local'
    os.environ['SERVER_PORT'] = '8888'
    if TEST_UNIT:
        from tests.unit.api_test import *
        from tests.unit.model_test import *
        from tests.unit.task_test import *
        from tests.unit.pipelines_test import *
    if TEST_INTEGRATION:
        from tests.integration.integration_test import *
        #AppEngineServer.APP_ENGINE_SDK = APP_ENGINE_SDK

if TEST_GUI:
    os.environ['SERVER_SOFTWARE'] = 'Development'
    os.environ['USER_EMAIL'] = 'administrador@eforcers.com.co'
    os.environ['USER_ID'] = '1'
    os.environ['USER_IS_ADMIN'] = '1'
    os.environ['AUTH_DOMAIN'] = 'testbed'
    from google.appengine.ext import testbed
    tb = testbed.Testbed()
    tb.activate()
    tb.init_user_stub()
    from myApp.tests.gui.gui_test import *
    AppEngineServer.APP_ENGINE_SDK = APP_ENGINE_SDK

    default_server = {
        'project_path': os.path.dirname(__file__),
        'fixtures_path': os.path.join(os.path.dirname(__file__), 'autobot',
                                      'tests', 'gui', 'fixtures'),
        'server_port': '8080'
    }

    AppEngineGuiTestCase.servers_config['default'] = default_server

if __name__ == '__main__':
    del sys.argv[1:]
    unittest.main()