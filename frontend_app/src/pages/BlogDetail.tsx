import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axios";
import { Header } from "../components/landing/Header";
import { Calendar, ArrowLeft, Tag as TagIcon } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Comment {
  id: number;
  author_name: string;
  author_email: string | null;
  content: string;
  created_at: string;
}

interface BlogPostDetail {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: number | null;
  published_date: string;
  is_published: boolean;
  featured_image: string | null;
  category: Category | null;
  tags: Tag[];
  comments: Comment[];
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    const fetchPost = async () => {
      setIsLoading(true);
      setNotFound(false);
      setError(null);
      try {
        // GET /api/blogs/<slug>/ -> BlogPostDetailAPIView, publicly accessible
        const response = await axios.get<BlogPostDetail>(`blogs/${slug}/`);
        if (isMounted) {
          setPost(response.data);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          if (err?.response?.status === 404) {
            setNotFound(true);
          } else {
            setError("Unable to load this blog post right now. Please try again later.");
          }
          setIsLoading(false);
        }
      }
    };

    fetchPost();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        {isLoading && (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted/40 rounded w-3/4" />
            <div className="h-4 bg-muted/40 rounded w-1/3" />
            <div className="h-64 bg-muted/40 rounded" />
          </div>
        )}

        {!isLoading && notFound && (
          <div className="text-center py-16">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Post not found
            </h1>
            <p className="text-muted-foreground mb-6">
              This blog post doesn't exist or hasn't been published yet.
            </p>
            <Link to="/blogs" className="text-primary hover:underline">
              Browse all posts
            </Link>
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-16">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!isLoading && post && (
          <article>
            {post.category && (
              <span className="inline-block text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-0.5 mb-4">
                {post.category.name}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_date)}
              </span>
            </div>

            {post.featured_image && (
              <div className="rounded-lg overflow-hidden mb-8 bg-muted">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Content is rendered as plain paragraphs. If your backend content
                field contains trusted HTML you control, you could render it
                with dangerouslySetInnerHTML instead — but that opens an XSS
                risk for any content not fully trusted/sanitized server-side,
                so plain text is the safer default here. */}
            <div className="prose prose-neutral max-w-none text-foreground">
              {post.content.split("\n").map((paragraph, i) =>
                paragraph.trim() ? (
                  <p key={i} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ) : null
              )}
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-border">
                <TagIcon className="w-4 h-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {post.comments.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Comments ({post.comments.length})
                </h2>
                <div className="space-y-6">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="border-b border-border pb-4">
                      <p className="font-medium text-foreground text-sm mb-1">
                        {comment.author_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        )}
      </main>
    </div>
  );
};

export default BlogDetail;