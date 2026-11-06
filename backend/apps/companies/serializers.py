from rest_framework import serializers

class CompanyProfileSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=200)
    industry = serializers.CharField(max_length=150)
    website = serializers.URLField(allow_blank=True, required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    location = serializers.CharField(max_length=200, allow_blank=True, required=False)
    employee_count = serializers.CharField(allow_blank=True, required=False)
    is_verified = serializers.BooleanField(read_only=True)
    verification_status = serializers.CharField(read_only=True)
    created_at = serializers.CharField(read_only=True, required=False)
