from rest_framework import serializers

class ApplicationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    student_id = serializers.CharField(read_only=True)
    student_name = serializers.CharField(read_only=True)
    student_email = serializers.CharField(read_only=True)
    opportunity_id = serializers.CharField()
    opportunity_title = serializers.CharField(read_only=True)
    company_id = serializers.CharField(read_only=True)
    company_name = serializers.CharField(read_only=True)
    status = serializers.ChoiceField(
        choices=['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'],
        default='applied'
    )
    status_notes = serializers.CharField(allow_blank=True, required=False)
    cover_letter = serializers.CharField(allow_blank=True, required=False)
    resume_url = serializers.CharField(allow_blank=True, required=False)
    match_score = serializers.FloatField(read_only=True, required=False)
    created_at = serializers.CharField(read_only=True, required=False)
