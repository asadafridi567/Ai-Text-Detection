from rest_framework import serializers
from .models import BlogPost, Category, Tag, Comment
from django.utils.text import slugify
from django.contrib.auth import get_user_model # <<< CHANGED LINE: Import get_user_model

# Get the currently active user model (which is core.CustomUser)
CustomUser = get_user_model() # <<< CHANGED LINE: Assign it to 'CustomUser' for consistency

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']
        read_only_fields = ['slug'] # Slug is auto-generated

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']
        read_only_fields = ['slug'] # Slug is auto-generated

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'author_name', 'author_email', 'content', 'created_at', 'is_approved', 'blog_post']
        read_only_fields = ['created_at', 'is_approved'] # created_at is auto_add, is_approved by admin
        extra_kwargs = {
            'blog_post': {'write_only': True, 'required': True} # blog_post is required for creation
        }

class BlogPostSerializer(serializers.ModelSerializer):
    # Nested serializers for read operations (when fetching blog posts)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True) # Display comments with the post

    # Write-only fields for creating/updating posts (e.g., from n8n or an admin frontend)
    # These allow sending IDs for ForeignKey and ManyToMany relationships
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, source='tags', write_only=True, required=False
    )
    # Correctly use CustomUser for the queryset
    author_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), # <<< CHANGED LINE: Use CustomUser here
        source='author',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'author', 'published_date',
            'is_published', 'featured_image', 'category', 'tags', 'comments',
            'category_id', 'tag_ids', 'author_id' # Include write-only fields
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at'] # slug is auto-generated

    # Custom create method to handle ManyToMany relationship (tags)
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', []) # Pop tags data if present
        blog_post = BlogPost.objects.create(**validated_data)
        blog_post.tags.set(tags_data) # Set many-to-many relationship
        return blog_post

    # Custom update method to handle ManyToMany relationship (tags)
    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None) # Pop tags data if present

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if tags_data is not None: # Only update if tags_data was provided
            instance.tags.set(tags_data)

        instance.save()
        return instance