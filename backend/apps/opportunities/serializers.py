from rest_framework import serializers

class OpportunitySkillSerializer(serializers.Serializer):
    skill_id = serializers.CharField()
    proficiency = serializers.IntegerField(min_value=1, max_value=4, default=2)

class OpportunitySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=200)
    company_id = serializers.CharField(read_only=True)
    company_name = serializers.CharField(read_only=True)
    type = serializers.ChoiceField(choices=['internship', 'full_time', 'part_time', 'contract'])
    status = serializers.ChoiceField(choices=['draft', 'active', 'closed', 'expired'], default='active')
    description = serializers.CharField()
    location = serializers.CharField(max_length=200)
    work_mode = serializers.ChoiceField(choices=['remote', 'onsite', 'hybrid'], default='hybrid')
    duration = serializers.CharField(max_length=100, required=False, allow_blank=True)
    salary_min = serializers.IntegerField(required=False, default=0)
    salary_max = serializers.IntegerField(required=False, default=0)
    salary_type = serializers.ChoiceField(choices=['monthly', 'annual', 'stipend'], default='monthly')
    required_skills = serializers.ListField(child=OpportunitySkillSerializer(), required=False, default=list)
    optional_skills = serializers.ListField(child=OpportunitySkillSerializer(), required=False, default=list)
    min_cgpa = serializers.FloatField(required=False, default=0.0)
    eligible_departments = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    deadline = serializers.DateTimeField(required=False)
    is_featured = serializers.BooleanField(default=False)
    created_at = serializers.CharField(read_only=True, required=False)
