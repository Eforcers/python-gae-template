# -*- coding: utf-8 -*-
from models import User
from tests.test import AppengineTestCase
from apis import UserApi
import mock
from protorpc.messages import Field
from tests.test import AppengineTestCase, copy_from_entity, validate_element

class UserAPITestCase(AppengineTestCase):
    USERS = ["administrator@test.com","user@test.com"]
    NEW_USER = "user2@test.com"

    def setUp(self):
        super(UserAPITestCase, self).setUp()
        for user_email in self.USERS:
            user = User(email=user_email)
            user.put()

    @mock.patch.object(Field, 'validate_element', validate_element)
    def test_user_list(self):
        user_api = UserApi()
        request = user_api.user_list.remote.request_type()
        users_list = [item.email for item in user_api.user_list(
            request).items]

        for user in users_list:
            self.assertIn(user, self.USERS)

    @mock.patch.object(Field, 'validate_element', validate_element)
    def test_user_add(self):
        autobot_api = UserApi()
        request = autobot_api.user_insert.remote.request_type()
        request.email = self.NEW_USER
        autobot_api.user_insert(request)

        user = User.query(User.email == self.NEW_USER).fetch(
            limit=1)[0]

        self.assertEquals(self.NEW_USER, user.email,
                          "User does not match ")
