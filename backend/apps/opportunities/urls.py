from django.urls import path
from apps.opportunities.views import (
    OpportunityListView, FeaturedOpportunitiesView, MyOpportunitiesView,
    OpportunityDetailView, InternshalaOpportunitiesView, AIGenerateJobPostingView
)

urlpatterns = [
    path('', OpportunityListView.as_view(), name='opportunity-list'),
    path('featured/', FeaturedOpportunitiesView.as_view(), name='opportunity-featured'),
    path('internshala/', InternshalaOpportunitiesView.as_view(), name='opportunity-internshala'),
    path('search/', InternshalaOpportunitiesView.as_view(), name='opportunity-search'),
    path('ai-generate/', AIGenerateJobPostingView.as_view(), name='opportunity-ai-generate'),
    path('my/', MyOpportunitiesView.as_view(), name='opportunity-my'),
    path('<str:pk>/', OpportunityDetailView.as_view(), name='opportunity-detail'),
]
