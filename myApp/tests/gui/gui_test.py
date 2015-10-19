# -*- coding: utf-8 -*-
import inspect
import logging
import unittest
import os
import subprocess
from shutil import copyfile
import sys
import time
from datetime import timedelta, datetime, date
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException, NoAlertPresentException, StaleElementReferenceException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from google.appengine.ext.remote_api import remote_api_stub
from google.appengine.ext import ndb

from endpoints_proto_datastore.ndb.model import EndpointsModel
from pytz import timezone
from models import User
from settings import get_setting


class AppEngineServer(object):
    APP_ENGINE_SDK = ''
    SERVER_NAME = 'localhost'

    def __init__(self, project_path, server_port, fixtures_path, datastore_path=None):
        self.project_path = project_path
        self.server_port = server_port
        self.datastore_path = datastore_path
        dev_server = os.path.join(self.__class__.APP_ENGINE_SDK, "dev_appserver.py")
        if self.copy_base_datastore():
            datastore = "--datastore_path=%s" % self.datastore_copy_path
            logging.info("datastore was be charged")
        else:
            datastore = "--clear_datastore=yes"
        command = [
            'python',
            dev_server,
            datastore,
            "--port=%s" % self.server_port,
             self.project_path,
        ]
        logging.info('Starting server command %s', command)

        self.dev_server = subprocess.Popen(command,
                                           stdin=subprocess.PIPE,
                                           stdout=subprocess.PIPE)
        #Fixtures folder
        self.fixtures_path = fixtures_path
        self.base_url = "http://%s:%s" % (self.__class__.SERVER_NAME, self.server_port)

    def terminate(self):
        self.dev_server.terminate()
        time.sleep(2) #wait for the file to be released after process terminate
        self.delete_datastore()

    def start_from_api(self, project_path, server_port, fixtures_path, datastore_path=None):
        import dev_appserver
        sys.path[1:1] = dev_appserver.EXTRA_PATHS

        from google.appengine.tools.devappserver2 import devappserver2
        from google.appengine.tools.devappserver2 import python_runtime

        #Fixtures folder
        self.fixtures_path = fixtures_path
        self.base_url = "http://%s:%s" % (self.__class__.SERVER_NAME, server_port)

        python_runtime._RUNTIME_ARGS = [
            sys.executable,
            os.path.join(os.path.dirname(dev_appserver.__file__),
                         '_python_runtime.py')
        ]
        options = devappserver2.PARSER.parse_args([
            '--admin_port', '0',
            '--port', server_port,
            '--datastore_path', ':memory:',
            '--logs_path', ':memory:',
            '--skip_sdk_update_check',
            '--',
        ] + [project_path])
        server = devappserver2.DevelopmentServer()
        server.start(options)
        self.server = server

    def terminate_from_api(self):
        self.server.stop()
        self.delete_datastore()

    def copy_base_datastore(self):
        if self.datastore_path:
            self.datastore_copy_path = os.path.join(os.path.split(self.datastore_path)[0],
                                  "%s.copy" % os.path.basename(self.datastore_path))
            copyfile(self.datastore_path,self.datastore_copy_path)
            return True
        else:
            return False

    def delete_datastore(self):
        if hasattr(self, 'datastore_copy_path') and self.datastore_copy_path:
            os.remove(self.datastore_copy_path)

class AppEngineGuiTestCase(unittest.TestCase):
    """
    Base class that handles everything related with Selenium testing in
    conjunction with a local GAE environment
    """
    driver = None
    servers_config = {}
    servers = {}
    ADMIN_USERNAME = "asdf@asdf.com"
    ADMIN_PASSWORD = "asdfasdf"

    class class_to_be_present_in_element(object):
        """ An expectation for checking if the given text is present in the
        specified element.
        locator, text
        """

        def __init__(self, locator, css_class_):
            self.locator = locator
            self.css_class = css_class_

        def __call__(self, driver):
            try:
                css_classes = EC._find_element(driver,
                                               self.locator).get_attribute(
                    'class')
                return self.css_class in css_classes
            except StaleElementReferenceException:
                return False

    def assert_element_present_with_text(self, tag, text, message):
        try:
            return WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH,
                                                "//%s[contains(text(),'%s')]"
                                                % (tag, text)))
            )
        except:
            self.fail(message)

    def assert_element_text(self, how, what, text, message):
        try:
            return WebDriverWait(self.driver, 10).until(
                EC.text_to_be_present_in_element((how, what), text)
            )
        except:
            self.fail(message)

    def assert_element_text_value(self, how, what, text, message):
        try:
            return WebDriverWait(self.driver, 10).until(
                EC.text_to_be_present_in_element_value((how, what), text)
            )
        except:
            self.fail(message)

    def assert_element_visible(self, how, what, message):
        try:
            return WebDriverWait(self.driver, 5).until(
                EC.visibility_of_element_located((how, what)))
        except:
            self.fail(message)

    def assert_element_invisible(self, how, what, message):
        try:
            return WebDriverWait(self.driver, 3).until(EC
            .invisibility_of_element_located((how, what)))
        except:
            self.fail(message)

    def assert_class_visible(self, how, what, css_class, message):
        try:
            return WebDriverWait(self.driver, 10).until(
                self.class_to_be_present_in_element((how, what), css_class)
            )
        except:
            logging.exception('')
            self.fail(message)

    def assert_element_present(self, how, what, message):
        try:
            return WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((how, what)))
        except:
            self.fail(message)

    def assert_element_not_present(self, how, what, message):
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((how, what)))
        except:
            return

        self.fail(message)

    def is_element_present(self, how, what):
        try:
            self.driver.find_element(by=how, value=what)
        except NoSuchElementException, e:
            return False
        return True

    def is_alert_present(self):
        try:
            self.driver.switch_to_alert()
        except NoAlertPresentException, e:
            return False
        return True

    def close_alert_and_get_its_text(self):
        try:
            alert = self.driver.switch_to_alert()
            alert_text = alert.text
            if self.accept_next_alert:
                alert.accept()
            else:
                alert.dismiss()
            return alert_text
        finally:
            self.accept_next_alert = True

    def table_header_index(self, table_id, header):
        xpath_count = len(self.driver.find_elements_by_xpath(
            "//table[@id='%s']/thead/tr/th" % table_id))
        for i in xrange(1, xpath_count + 1):
            head = self.driver.find_element(By.XPATH,
                                            "//table[@id='%s']/thead/tr/th[%s]" %
                                            (table_id, i))
            logging.info('Head element [%s]', head)
            if header in head.text:
                return i

    def assert_table_cell(self, table_id, column_name, row=1,
                          body=None, value=None, message=None,
                          multiple_body=False, column=None):
        column_index = column if column else self.table_header_index(
            table_id, column_name)

        if not body:
            cell_xpath = "//table[@id='%s']/tbody[%s]/tr/td[%s]" if multiple_body\
                else "//table[@id='%s']/tbody/tr[%s]/td[%s]"
            cell_xpath = cell_xpath % (table_id, row, column_index)
        elif multiple_body:
            cell_xpath = "//table[@id='%s']/tbody[%s]/tr[%s]/td[%s]"
            cell_xpath = cell_xpath % (table_id, body, row, column_index)

        table_cell = self.driver.find_element_by_xpath(cell_xpath)

        if message:
            message += " (%s != %s)" % (table_cell.text, value)
        else:
            message = " (%s != %s)" % (table_cell.text, value)

        self.assert_element_text(By.XPATH, cell_xpath, value, message)

    @classmethod
    def setUpClass(cls):
        super(AppEngineGuiTestCase, cls).setUpClass()
        logging.info('Set up class...')
        #Start appengine server via a new subprocess
        for key, config in cls.servers_config.iteritems():
            server = AppEngineServer(project_path=config['project_path'],
                                     server_port=config['server_port'],
                                     fixtures_path=config['fixtures_path'],
                                     datastore_path=config.get('datastore_path', None))
            cls.servers[key] = server

    @classmethod
    def tearDownClass(cls):
        super(AppEngineGuiTestCase, cls).tearDownClass()
        logging.info('Tearing down class...')
        servers_to_delete = []
        for key, server in cls.servers.iteritems():
            logging.info('Teminating [%s] server', key)
            server.terminate()
            if key != 'default':
                servers_to_delete.append(key)

        for server in servers_to_delete:
            cls.servers.pop(server, None)

        try:
            sys.exit()
        except:
            pass

    def setUp(self):
        logging.info('Set up...')
        #Selenium initialization stuff
        self.driver = webdriver.Firefox()
        self.driver.maximize_window()
        self.driver.implicitly_wait(30)

        self.verificationErrors = []
        self.accept_next_alert = True

    def tearDown(self):
        logging.info('Tearing down...')
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)
        import models
        for name, class_model in inspect.getmembers(models, inspect.isclass):
            if issubclass(
                    class_model, EndpointsModel):
                logging.info("Deleting entities of kind [%s]" %
                             class_model.__name__)
                try:
                    ndb.delete_multi(class_model.query().fetch(keys_only=True))
                except:
                    pass


    def default_login(self, url, user_email=None, clear_cache=True):
        #Login and load home page
        self.driver.get(self.default_server.base_url + '/admin')
        if user_email:
            self.driver.find_element_by_id("email").clear()
            self.driver.find_element_by_id("email").send_keys(user_email)
        self.driver.find_element_by_id('admin').click()
        self.driver.find_element_by_id('submit-login').click()
        if clear_cache:
            self.driver.get(self.default_server.base_url + '/admin/clean/cache')
            time.sleep(1)
        self.driver.get(self.default_server.base_url + url)

    def logout(self):
        self.driver.find_element_by_xpath(
            '//*[@id="bs-example-navbar-collapse-9"]/p/a'
        ).click()
        time.sleep(1)
        self.driver.find_element_by_link_text("Salir").click()


    def initialize_default_datastore(self):
        time.sleep(3)

        def auth_func():
            logging.info("initializing the datastore ...")
            return (self.ADMIN_USERNAME, self.ADMIN_PASSWORD)

        remote_api_stub.ConfigureRemoteApi(
            None,
            '/_ah/remote_api',
            auth_func,
            '%s:%s' % (self.default_server.SERVER_NAME, self.default_server.server_port)
        )

    def open_context_menu(self, row, options, table_id="sessionsTable"):
        """
        Returns the TD element in the given row and column and click on
        the icon
        """
        td_element = self.driver.find_element_by_css_selector("#sessionsTable > tbody > tr > td.td-config > a")

        td_element.find_element_by_tag_name("i").click()
        last_option = None
        for option in options:
            last_option = self.driver.find_element_by_link_text(option)

            if(options[-1] != option):
                hover = ActionChains(self.driver).move_to_element(last_option)
                hover.perform()
            else:
                last_option.click()
    @property
    def default_server(self):
        return self.servers['default']

    @property
    def default_server(self):
        return self.servers['default']



class UserGUITestCase(AppEngineGuiTestCase):
    def setUp(self):
        super(UserGUITestCase, self).setUp()
        self.initialize_default_datastore()
        user = User(email="administrador@test.com",
                    first_name="FirstName", last_name="LastName")
        user.put()

    def test_list_user(self):
        timestamp = time.time()
        #Uploads a valid file or two users
        driver = self.driver
        logging.info("The datastore was be charged...")
        self.initialize_default_datastore()

        #Login and navigate
        self.default_login("/admin/",
                           user_email='administrador@test.com.co')

        self.assert_element_present(
            By.ID,
            'saveBotton',
            'saveBotton user button was not visible'
        ).click()
        time.sleep(3)
        self.assert_table_cell("table1","Nombre",column=0,value="Firstname")
