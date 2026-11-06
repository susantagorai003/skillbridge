from django.urls import path
from apps.matching.views import MatchCalculationView, RecommendedOpportunitiesView

urlpatterns = [
    path('', MatchCalculationView.as_view(), name='matching-calculate'),
    path('recommendations/', RecommendedOpportunitiesView.as_view(), name='matching-recommendations'),
]
