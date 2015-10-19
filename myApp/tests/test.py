import base64
import unittest

from google.appengine.ext import testbed, deferred
from google.appengine.ext.ndb.model import ComputedProperty
from protorpc import message_types
from endpoints_proto_datastore.ndb.model import properties
from settings import get_setting
import decorators
from functools import wraps

class AppengineTestCase(unittest.TestCase):
    settings_params = {}
    def setUp(self):
        from main import flask_app
        self.app = flask_app
        self.client = self.app.test_client()
        self._ctx = self.app.test_request_context()
        self._ctx.push()
        self.app.config['TESTING'] = True
        self.app.config['CSRF_ENABLED'] = False
        for key, value in self.settings_params.items():
            self.app.config[key] = value
        # Setups app engine test bed. See: http://code.google.com/appengine/docs/python/tools/localunittesting.html#Introducing_the_Python_Testing_Utilities
        self.testbed = testbed.Testbed()
        #This emulate the user is authenticated
        self.testbed.setup_env(
            USER_EMAIL='administrador@eforcers.com.co',
            USER_ID='1',
            USER_IS_ADMIN='1'
        )
        self.testbed.activate()
        self.testbed.init_datastore_v3_stub()
        self.testbed.init_user_stub()
        self.testbed.init_memcache_stub()
        self.testbed.init_taskqueue_stub(root_path=".")
        self.task_stub = self.testbed.get_stub(testbed.TASKQUEUE_SERVICE_NAME)
        decorators.IS_TEST = True

    def tearDown(self):
        self.testbed.deactivate()
        if getattr(self, '_ctx') and self._ctx is not None:
            self._ctx.pop()
        del self._ctx

    def run_queue_tasks(self, queue='default'):
        api_tasks = self.task_stub.GetTasks(queue)
        while len(api_tasks) >0:
            self.task_stub.FlushQueue(queue)
            for api_task in api_tasks:
                deferred.run(base64.b64decode(api_task['body']))
            api_tasks = self.task_stub.GetTasks(queue)


def string_as_list(value):
    if value == '' or value is None:
        return None
    return [value]


def copy_from_entity(self, entity):
    """
    Mock is made to the methods validate_element and  _CopyFromEntity
    because in testing environment  throws exception because classes are
    not the same
    :param entity:
    :return:
    """
    for prop in entity._EndpointsPropertyItervalues():
        attr_name = prop._code_name
        value = getattr(entity, attr_name)
        if value is not None:
            if isinstance(prop, properties.EndpointsAliasProperty):
                value_set = getattr(self, attr_name) is not None
            elif isinstance(prop, ComputedProperty):
                value_set = True
            else:
                value_set = prop._name in self._values
            if not value_set:
                setattr(self, attr_name, value)

def validate_element(self, value):
    pass

def session_to_dict(session):
    date_format = get_setting('ENDPOINTS_DATE_FORMAT')
    session_dict = session.to_dict()
    session_dict['start_date_time'] = session_dict['start_date_time'].\
        strftime(date_format) if session_dict[
        'start_date_time'] else None
    del session_dict['topic_key']
    del session_dict['project_key']
    del session_dict['autotask_contact_key']
    session_dict['created_by'] = session.created_by._User__email
    session_dict['modified_by'] = session.modified_by._User__email
    session_dict['created'] = session_dict['created'].strftime(date_format)
    session_dict['modified'] = session_dict['modified'].strftime(
        date_format)
    return session_dict



def method(request_type=message_types.VoidMessage,
           response_type=message_types.VoidMessage):
  print "hola mundo"