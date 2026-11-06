from rest_framework import serializers

class SkillCategorySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(allow_blank=True, required=False)
    icon = serializers.CharField(allow_blank=True, required=False)

class SkillSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=100)
    category_id = serializers.CharField()
    description = serializers.CharField(allow_blank=True, required=False)
    created_at = serializers.CharField(read_only=True, required=False)

class JobRoleSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=150)
    description = serializers.CharField(allow_blank=True, required=False)
    created_at = serializers.CharField(read_only=True, required=False)

class JobRoleSkillSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    job_role_id = serializers.CharField()
    skill_id = serializers.CharField()
    required_proficiency = serializers.IntegerField(min_value=1, max_value=4, default=2)
    importance = serializers.ChoiceField(choices=['required', 'preferred', 'nice_to_have'], default='required')
    skill_info = SkillSerializer(read_only=True, required=False)
