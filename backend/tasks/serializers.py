from rest_framework import serializers
from .models import Task, TaskLog

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'completed',
            'created_at',
        ]
        
        read_only_fields = [
            'id',
            'created_at',
        ]


class TaskLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskLog
        fields = [
            'id',
            'task_id',
            'task_title',
            'action',
            'old_data',
            'new_data',
            'created_at',
        ]
        read_only_fields = fields
