# blogs/models.py
from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.contrib.auth import get_user_model # <<< CHANGED LINE

# Get the currently active user model (which is core.CustomUser)
User = get_user_model() # Assign it to 'User' for consistency in ForeignKey

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=200, blank=True)
    content = models.TextField()
    # Use the User variable which now points to your CustomUser model
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='blog_posts')
    published_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    featured_image = models.ImageField(upload_to='blog_images/', blank=True, null=True)

    # Relationships
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts')

    class Meta:
        ordering = ['-published_date']
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Comment(models.Model):
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    author_name = models.CharField(max_length=100)
    author_email = models.EmailField(blank=True, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.author_name} on {self.blog_post.title}"