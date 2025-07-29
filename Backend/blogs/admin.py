# blogs/admin.py
from django.contrib import admin
from django.contrib.auth import get_user_model # To correctly reference your CustomUser
from .models import BlogPost, Category, Tag, Comment

# Get the active user model (which is core.CustomUser)
CustomUser = get_user_model()

# Register Category and Tag models directly
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)} # Auto-fill slug from name for convenience
    search_fields = ('name',)

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)} # Auto-fill slug from name for convenience
    search_fields = ('name',)

# Register Comment model
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('blog_post', 'author_name', 'author_email', 'created_at', 'is_approved')
    list_filter = ('is_approved', 'created_at')
    search_fields = ('author_name', 'author_email', 'content')
    actions = ['approve_comments', 'disapprove_comments'] # Custom actions for moderation

    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, "Selected comments have been approved.")
    approve_comments.short_description = "Approve selected comments"

    def disapprove_comments(self, request, queryset):
        queryset.update(is_approved=False)
        self.message_user(request, "Selected comments have been disapproved.")
    disapprove_comments.short_description = "Disapprove selected comments"


# Register BlogPost model with a custom admin class
@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'is_published', 'published_date', 'created_at')
    list_filter = ('is_published', 'category', 'tags', 'published_date')
    search_fields = ('title', 'content')
    prepopulated_fields = {'slug': ('title',)} # Auto-fill slug from title
    date_hierarchy = 'published_date' # Adds a date-based drilldown navigation
    ordering = ('-published_date',) # Default ordering in the admin list

    # Use raw_id_fields for ForeignKey to CustomUser for better admin experience
    # This shows an ID field with a lookup button instead of a dropdown for many users
    raw_id_fields = ('author',)

    # Use filter_horizontal for ManyToManyField for a better UI experience
    filter_horizontal = ('tags',)

    # Optionally, customize the fields displayed in the add/change form
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'content', 'featured_image', 'is_published')
        }),
        ('Relationships', {
            'fields': ('author', 'category', 'tags')
        }),
        ('Dates', {
            'fields': ('published_date',)
        }),
    )

    # If you want to customize the form for adding a new blog post
    # add_fieldsets = (
    #     (None, {
    #         'classes': ('wide',),
    #         'fields': ('title', 'slug', 'content', 'featured_image', 'is_published', 'author', 'category', 'tags', 'published_date'),
    #     }),
    # )
