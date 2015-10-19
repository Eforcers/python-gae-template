__author__ = 'carlos.prieto'

from protorpc import messages
import endpoints

TASK_CONTAINER = endpoints.ResourceContainer(
    id = messages.IntegerField(1)
)

class TaskMessage(messages.Message):
    id = messages.IntegerField(1)
    description = messages.StringField(2)
    is_complete = messages.BooleanField(3)

class TaskListMessage(messages.Message):
    items = messages.MessageField(TaskMessage, 1, repeated=True)