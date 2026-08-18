from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from tasks.views import TaskLogViewSet, TaskViewSet


router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'logs', TaskLogViewSet, basename='task-log')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(router.urls)),
]
