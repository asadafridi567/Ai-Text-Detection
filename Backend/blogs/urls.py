# myapp/urls.py
from django.urls import path
from .views import *

urlpatterns = [
    path('blogs/create/', BlogPostCreateAPIView.as_view(), name='api_create_blog_post'),
    path('blogs/', BlogPostListAPIView.as_view(), name='api_blog_list'),
    path('blogs/<slug:slug>/', BlogPostDetailAPIView.as_view(), name='api_blog_detail'),
    path('categories/', CategoryListAPIView.as_view(), name='api_category_list'),
    path('tags/', TagListAPIView.as_view(), name='api_tag_list'),
    path('comments/', CommentCreateAPIView.as_view(), name='api_create_comment'),
    path('blogs/<int:blog_post_id>/comments/', CommentListAPIView.as_view(), name='api_blog_comments_list'),
]