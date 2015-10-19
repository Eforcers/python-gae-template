import logging
from models import User


def has_profile(email, profiles):
    return User.has_profile(email, profiles)