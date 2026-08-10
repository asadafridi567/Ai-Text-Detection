import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { Header } from "../components/landing/Header";
import { Calendar, User } from "lucide-react";

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

interface BlogPostSummary {
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
}

// Strip a plaintext preview out of the content (which may contain HTML/markdown)
function getExcerpt(content: string, maxLength = 160): string {
  const plain = content.replace(/<[^>]+>/g, "").trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trimEnd() + "...";
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

const Blogs = () => {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      try {
        // GET /api/blogs/ -> BlogPostListAPIView, publicly accessible (AllowAny)
        const response = await axios.get<BlogPostSummary[]>("blogs/");
        if (isMounted) {
          setPosts(response.data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load blog posts right now. Please try again later.");
          setIsLoading(false);
        }
      }
    };

    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Blog
          </h1>
          <p className="text-muted-foreground">
            Insights on academic integrity, AI writing, and plagiarism detection.
          </p>
        </div>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg border border-border bg-muted/40 h-48"
              />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-16">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No blog posts published yet. Check back soon.
            </p>
          </div>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blogs/${post.slug}`}
                className="group block rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.featured_image && (
                  <div className="h-40 w-full overflow-hidden bg-muted">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  {post.category && (
                    <span className="inline-block text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-0.5 mb-3">
                      {post.category.name}
                    </span>
                  )}
                  <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {getExcerpt(post.content)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.published_date)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blogs;