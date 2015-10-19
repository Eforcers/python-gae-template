# -*- coding: utf-8 -*-
from models import User
from tests.test import AppengineTestCase
import constants

class UserTestCase(AppengineTestCase):


    def test_has_profile(self):
        self.assertFalse(User.has_profile(None, None),
                         'None user and profile should not have any profile')
        self.assertFalse(User.has_profile('', []),
                         'Empty user and profile should not have any profile')
        self.assertFalse(User.has_profile('', [constants.PROFILE_ADMIN]),
                         'Non existing user should not have profiles')
        user = User(email='administrador@test.com', profiles=[
            constants.PROFILE_ADMIN
        ])
        user_key = user.put()
        self.assertTrue(User.has_profile(
            'administrador@test.com', [constants.PROFILE_ADMIN]
        ), 'Profiles have been assigned')
        user_key.delete()
