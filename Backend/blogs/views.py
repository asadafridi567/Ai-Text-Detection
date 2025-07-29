# myapp/views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny # For simplicity, but consider authentication
from django.utils.text import slugify
from django.shortcuts import get_object_or_404
from django.db import transaction # For atomic operations
from django.http import Http404

from .models import BlogPost, Category, Tag, Comment
from .serializers import BlogPostSerializer, CategorySerializer, TagSerializer, CommentSerializer
from users.models import CustomUser # Adjust this import path if CustomUser is in a different file/app

# --- API for N8N (Blog Post Creation) ---
# This view is specifically for N8N to create blog posts.
# It should have strong authentication in production (e.g., API Key, not AllowAny).
class BlogPostCreateAPIView(APIView):
    permission_classes = [AllowAny] # WARNING: Use proper authentication in production!

    def post(self, request, format=None):
        data = request.data.copy() # Make a mutable copy of the request data

        # Auto-generate slug if not provided in the request
        title = data.get('title')
        slug = data.get('slug')
        if title and not slug:
            slug = slugify(title)
            # Ensure slug is unique
            original_slug = slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exists():
                slug = f"{original_slug}-{counter}"
                counter += 1
            data['slug'] = slug # Add generated slug to data for serializer

        # Handle author assignment using your CustomUser model
        author_id = data.get('author_id')
        if author_id:
            try:
                author_instance = CustomUser.objects.get(pk=author_id)
                data['author'] = author_instance.id # Pass ID to serializer for ForeignKey
            except CustomUser.DoesNotExist:
                # If author_id is invalid, let serializer validation handle it
                pass

        # Handle category assignment
        category_id = data.get('category_id')
        if category_id:
            try:
                Category.objects.get(pk=category_id) # Just check if it exists
                data['category'] = category_id
            except Category.DoesNotExist:
                pass # Let serializer validation handle invalid category_id

        # Handle tags assignment (Many-to-Many)
        tag_ids = data.get('tag_ids')
        
        # Ensure tag_ids is always a list for iteration
        if tag_ids is not None:
            # If it's a single integer (e.g., 8), wrap it in a list [8]
            if not isinstance(tag_ids, list):
                tag_ids = [tag_ids]
            
            # Now, tag_ids is guaranteed to be a list (even if empty or single-item)
            # Check if all provided tag_ids exist
            if not all(Tag.objects.filter(pk=tag_id).exists() for tag_id in tag_ids):
                return Response({"tag_ids": ["One or more tag IDs are invalid."]}, status=status.HTTP_400_BAD_REQUEST)
            data['tags'] = tag_ids # Pass the list of IDs to serializer for ManyToMany
        else:
            data['tags'] = [] # If no tag_ids provided, ensure it's an empty list
            
        serializer = BlogPostSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- APIs for React Frontend (Publicly Accessible Blog Content) ---

# List all published blog posts
class BlogPostListAPIView(APIView):
    permission_classes = [AllowAny] # Publicly accessible

    def get(self, request, format=None):
        posts = BlogPost.objects.filter(is_published=True).order_by('-published_date')
        serializer = BlogPostSerializer(posts, many=True)
        return Response(serializer.data)

# Retrieve a single published blog post by slug
class BlogPostDetailAPIView(APIView):
    permission_classes = [AllowAny] # Publicly accessible

    def get_object(self, slug):
        try:
            return BlogPost.objects.get(slug=slug, is_published=True)
        except BlogPost.DoesNotExist:
            raise Http404

    def get(self, request, slug, format=None):
        post = self.get_object(slug)
        serializer = BlogPostSerializer(post)
        return Response(serializer.data)

# List all categories
class CategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        categories = Category.objects.all().order_by('name')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

# List all tags
class TagListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        tags = Tag.objects.all().order_by('name')
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)

# --- API for React Frontend (Comment Creation) ---
# This allows users to add comments to a specific blog post.
class CommentCreateAPIView(APIView):
    permission_classes = [AllowAny] # Allow any user to comment

    def post(self, request, format=None):
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            # Comments are unapproved by default, requiring moderation
            serializer.save(is_approved=False)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- API for Listing Comments for a Specific Post ---
class CommentListAPIView(APIView):
    permission_classes = [AllowAny]

    def get_object_list(self, blog_post_id):
        try:
            # Ensure the blog post exists and is published
            blog_post = BlogPost.objects.get(pk=blog_post_id, is_published=True)
            return Comment.objects.filter(blog_post=blog_post, is_approved=True).order_by('created_at')
        except BlogPost.DoesNotExist:
            raise Http404

    def get(self, request, blog_post_id, format=None):
        comments = self.get_object_list(blog_post_id)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)