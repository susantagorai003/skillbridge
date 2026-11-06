from rest_framework.views import APIView
from rest_framework.response import Response
from apps.accounts.permissions import IsAuthenticated
from database.repositories.notification_repository import NotificationRepository


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        repo = NotificationRepository()
        unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        result = repo.find_by_user(request.user.id, unread_only=unread_only, page=page, page_size=page_size)
        unread_count = repo.unread_count(request.user.id)
        return Response({'success': True, 'unread_count': unread_count, **result})


class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        repo = NotificationRepository()
        updated = repo.mark_read(pk)
        return Response({'success': bool(updated)})


class MarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        repo = NotificationRepository()
        count = repo.mark_all_read(request.user.id)
        return Response({'success': True, 'modified': count})


class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        repo = NotificationRepository()
        count = repo.unread_count(request.user.id)
        return Response({'success': True, 'unread_count': count})
