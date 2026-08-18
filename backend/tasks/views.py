from rest_framework import status, viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Task, TaskLog
from .serializers import TaskSerializer, TaskLogSerializer


class TaskLogViewSet(viewsets.ViewSet):
    def list(self, request):
        logs = TaskLog.objects.all().order_by('-created_at')
        serializer = TaskLogSerializer(logs, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        log = get_object_or_404(TaskLog, pk=pk)
        serializer = TaskLogSerializer(log)
        return Response(serializer.data)

class TaskViewSet(viewsets.ViewSet):
    # list all tasks
    def list(self, request): 
        tasks = Task.objects.all().order_by('-created_at')
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    
    # create new task
    def create(self, request):
        serializer = TaskSerializer(data=request.data)
        
        if serializer.is_valid():
            task = serializer.save()

            TaskLog.objects.create(
                task_id=task.id,
                task_title=task.title,
                action='CREATE',
                old_data=None,
                new_data=TaskSerializer(task).data
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
        
    # get task by id 
    def retrieve(self, request, pk=None):
        task = get_object_or_404(Task, pk=pk)
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    
    # update task (title, desc)
    def update (self, request, pk=None):
        task = get_object_or_404(Task, pk=pk)
        old_data = TaskSerializer(task).data
        
        data = {
            'title' : request.data.get('title'),
            'description' : request.data.get('description', '')
        }
        
        serializer = TaskSerializer(
            task,
            data=data,
            partial=True
        )
        
        if serializer.is_valid():
            updated_task = serializer.save()

            TaskLog.objects.create(
                task_id=updated_task.id,
                task_title=updated_task.title,
                action='UPDATE',
                old_data=old_data,
                new_data=TaskSerializer(updated_task).data
            )

            return Response(serializer.data)
        
        return Response(
            serializer.errors,
            status = status.HTTP_400_BAD_REQUEST
        )
        
    
    # check task if complete 
    def partial_update(self, request, pk=None):
        task = get_object_or_404(Task, pk=pk)

        old_data = TaskSerializer(task).data

        task.completed = not task.completed
        task.save()

        serializer = TaskSerializer(task)

        TaskLog.objects.create(
            task_id=task.id,
            task_title=task.title,
            action='STATUS_UPDATE',
            old_data=old_data,
            new_data=serializer.data
        )

        return Response(serializer.data)
    
    # delete a task
    def destroy(self, request, pk=None):
        task = get_object_or_404(Task, pk=pk)

        task_id = task.id
        task_title = task.title
        old_data = TaskSerializer(task).data

        task.delete()

        TaskLog.objects.create(
            task_id=task_id,
            task_title=task_title,
            action='DELETE',
            old_data=old_data,
            new_data=None
        )

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )
        
