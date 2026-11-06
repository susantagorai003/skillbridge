from django.urls import path
from apps.companies.views import (
    CompanyProfileView, CandidateDiscoveryView, VerifyCompanyView, CompanyDashboardView,
    CompanyEnrichView, CompanyDriveRequestView, InterviewScheduleView, OfferReleaseView
)

urlpatterns = [
    path('profile/', CompanyProfileView.as_view(), name='company-profile'),
    path('enrich/', CompanyEnrichView.as_view(), name='company-enrich'),
    path('candidates/', CandidateDiscoveryView.as_view(), name='company-candidates'),
    path('drives/request/', CompanyDriveRequestView.as_view(), name='company-drive-request'),
    path('interviews/schedule/', InterviewScheduleView.as_view(), name='company-interview-schedule'),
    path('offers/issue/', OfferReleaseView.as_view(), name='company-offer-release'),
    path('<str:company_id>/verify/', VerifyCompanyView.as_view(), name='company-verify'),
    path('dashboard/', CompanyDashboardView.as_view(), name='company-dashboard'),
]
