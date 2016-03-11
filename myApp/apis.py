# -*- coding: utf-8 -*-
import constants
from api_messages import TASK_CONTAINER, TaskMessage, TaskListMessage
from decorators import multitenat_required
import endpoints
from models import User
from protorpc import remote

"""
    API REST de usuarios
    utiliza la libreria protodatastore que sirve como puente entre la entidad
    User y los endpoints
"""
@endpoints.api(name='user', version='v1',
               title='user',
               description='Backend API for managing AutoBot related entities',
               allowed_client_ids=[
                   endpoints.API_EXPLORER_CLIENT_ID,
                   constants.OAUTH2_CLIENT_ID],
               audiences=[constants.OAUTH2_CLIENT_ID])
class UserApi(remote.Service):
    @multitenat_required()
    @User.method(path='user', http_method='POST', name='insertUser')
    def user_insert(self, user_model):
        current_user = endpoints.get_current_user()
        if current_user is None:
          raise endpoints.UnauthorizedException('Invalid token.')
        user_model.put()
        return user_model

    @multitenat_required()
    @User.query_method(path='users', name='listUser')
    def user_list(self, query):
        current_user = endpoints.get_current_user()
        if current_user is None:
          raise endpoints.UnauthorizedException('Invalid token.')

        return query

"""
    API REST de tareas
    ejemplo de un endpoint donde se realizan a mano los mensajes sin tener el
    vinculo con el datastore
"""
@endpoints.api(name='task', version='v1',
               title='task',
               description='Backend API for managing AutoBot related entities')
class TaskApi(remote.Service):
    TASK_LIST = [{"description":"TAREA1",'is_complete':True},
                 {"description":"TAREA2",'is_complete':False}]

    @multitenat_required()
    @endpoints.method(TASK_CONTAINER, TaskMessage, path='task', name='getTask',
                      http_method='GET')
    def get_task(self, request):
        task = self.TASK_LIST[request.id]
        task_message = TaskMessage(description=task['description'],
                                   is_complete=task['is_complete'])
        return task_message

    @multitenat_required()
    @endpoints.method(endpoints.ResourceContainer(), TaskListMessage, path='tasks',
                      name='listTask', http_method='GET')
    def list_task(self, request):
        tasks = [TaskMessage(description=task['description'],
                             is_complete=task['is_complete'])
                 for task in self.TASK_LIST]

        tasks_message = TaskListMessage(items=tasks)
        return tasks_message
