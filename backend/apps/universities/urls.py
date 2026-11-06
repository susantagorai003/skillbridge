from django.urls import path
from apps.universities.views import UniversityListView, UniversityDetailView

urlpatterns = [
    path('', UniversityListView.as_view(), name='university-list'),
    path('<str:pk>/', UniversityDetailView.as_view(), name='university-detail'),
]
