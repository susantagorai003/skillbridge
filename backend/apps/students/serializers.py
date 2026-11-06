from rest_framework import serializers

class StudentSkillSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    student_id = serializers.CharField(read_only=True)
    skill_id = serializers.CharField()
    proficiency_level = serializers.IntegerField(min_value=1, max_value=4, default=1)
    is_verified = serializers.BooleanField(default=False)
    source = serializers.CharField(default='self_reported')
    skill_name = serializers.CharField(read_only=True, required=False)

class StudentProfileSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    university_id = serializers.CharField(allow_blank=True, required=False)
    department_id = serializers.CharField(allow_blank=True, required=False)
    degree = serializers.CharField(allow_blank=True, required=False)
    semester = serializers.IntegerField(default=1, required=False)
    cgpa = serializers.FloatField(default=0.0, required=False)
    phone = serializers.CharField(allow_blank=True, required=False)
    career_interests = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    skills = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    github = serializers.URLField(allow_blank=True, required=False)
    linkedin = serializers.URLField(allow_blank=True, required=False)
    resume_url = serializers.CharField(allow_blank=True, required=False)
    bio = serializers.CharField(allow_blank=True, required=False)
    created_at = serializers.CharField(read_only=True, required=False)
