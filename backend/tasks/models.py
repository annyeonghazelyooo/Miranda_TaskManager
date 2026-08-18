from django.db import models

class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class TaskLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('STATUS_UPDATE', 'Status Update'),
        ('DELETE', 'Delete'),
    ]

    task_id = models.PositiveIntegerField()
    task_title = models.CharField(max_length=255)

    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES
    )

    old_data = models.JSONField(
        null=True,
        blank=True
    )

    new_data = models.JSONField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f'{self.action} - {self.task_title}'
