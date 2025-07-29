import React, { Component } from 'react';
import { Container, Row, Col, Button, Card, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

// Load Marked.js for Markdown rendering
// In a real project, you'd install it: npm install marked
// For this immersive, we'll load it via CDN.
// This script will be appended to the head when the component is rendered.
const loadMarkedScript = () => {
    if (!window.marked) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        script.onload = () => {
            console.log('Marked.js loaded');
            // You might need to force a re-render if the component loads before marked.js
            // For simplicity in this example, we assume it loads quickly enough.
        };
        document.head.appendChild(script);
    }
};

class Blogs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blogPosts: [],
            loading: true,
            error: null,
            currentPage: 'list', // 'list' or 'detail'
            selectedBlogSlug: null,
        };
        // Replace with your Django API URL (e.g., your ngrok URL)
        this.DJANGO_API_BASE_URL = 'http://localhost:8000/api';
    }

    componentDidMount() {
        loadMarkedScript(); // Load Marked.js when component mounts
        this.fetchBlogPosts();
    }

    fetchBlogPosts = async () => {
        this.setState({ loading: true, error: null });
        try {
            const response = await fetch(`${this.DJANGO_API_BASE_URL}/blogs/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.setState({ blogPosts: data });
        } catch (err) {
            this.setState({ error: err.message });
        } finally {
            this.setState({ loading: false });
        }
    };

    fetchSingleBlogPost = async (slug) => {
        this.setState({ loading: true, error: null });
        try {
            const response = await fetch(`${this.DJANGO_API_BASE_URL}/blogs/${slug}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.setState({ selectedBlogSlug: slug, blogPosts: [data] }); // Store single post in blogPosts array for consistency
        } catch (err) {
            this.setState({ error: err.message });
        } finally {
            this.setState({ loading: false });
        }
    };

    navigateToBlogDetail = (slug) => {
        this.setState({ currentPage: 'detail', selectedBlogSlug: slug }, () => {
            this.fetchSingleBlogPost(slug); // Fetch the specific blog post
        });
    };

    navigateToBlogList = () => {
        this.setState({ currentPage: 'list', selectedBlogSlug: null }, () => {
            this.fetchBlogPosts(); // Re-fetch all blog posts
        });
    };

    renderBlogList() {
        const { blogPosts, loading, error } = this.state;

        if (loading) {
            return (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status" className="me-2" />
                    <p className="mt-2">Loading blog posts...</p>
                </div>
            );
        }

        if (error) {
            return (
                <Alert variant="danger" className="my-5 text-center">
                    Error: {error}
                </Alert>
            );
        }

        if (blogPosts.length === 0) {
            return (
                <Alert variant="info" className="my-5 text-center">
                    No blog posts found.
                </Alert>
            );
        }

        return (
            <Row xs={1} md={2} lg={3} className="g-4">
                {blogPosts.map((post) => (
                    <Col key={post.id}>
                        <Card className="h-100 shadow-sm rounded-lg overflow-hidden">
                            {post.featured_image ? (
                                <Card.Img
                                    variant="top"
                                    src={post.featured_image}
                                    alt={post.title}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevent infinite loop
                                        e.target.src = `https://placehold.co/600x400/E0E7FF/4338CA?text=Image+Not+Found`; // Placeholder
                                    }}
                                />
                            ) : (
                                <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                                    <span className="text-muted">No Image</span>
                                </div>
                            )}
                            <Card.Body className="d-flex flex-column">
                                <div className="mb-2">
                                    {post.category && (
                                        <span className="badge bg-primary text-white me-2 rounded-pill">
                                            {post.category.name}
                                        </span>
                                    )}
                                    {post.tags && post.tags.map(tag => (
                                        <span key={tag.id} className="badge bg-secondary text-white me-1 rounded-pill">
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                                <Card.Title className="h5 fw-bold text-dark mb-2 line-clamp-2">
                                    {post.title}
                                </Card.Title>
                                <Card.Text className="text-muted small mb-3 line-clamp-3">
                                    {/* Display a snippet of content, remove markdown for cleaner preview */}
                                    {post.content.replace(/#+\s/g, '').replace(/\*+/g, '').replace(/\[.*?\]\(.*?\)/g, '').substring(0, 150)}...
                                </Card.Text>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => this.navigateToBlogDetail(post.slug)}
                                    className="mt-auto align-self-start"
                                >
                                    Read More →
                                </Button>
                            </Card.Body>
                            <Card.Footer className="text-muted small">
                                Published: {new Date(post.published_date).toLocaleDateString()}
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    }

    renderBlogDetail() {
        const { blogPosts, loading, error, selectedBlogSlug } = this.state;
        const blogPost = blogPosts.find(post => post.slug === selectedBlogSlug); // Get the single post from the state

        if (loading) {
            return (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status" className="me-2" />
                    <p className="mt-2">Loading blog post...</p>
                </div>
            );
        }

        if (error) {
            return (
                <Alert variant="danger" className="my-5 text-center">
                    Error: {error}
                </Alert>
            );
        }

        if (!blogPost) {
            return (
                <Alert variant="info" className="my-5 text-center">
                    Blog post not found.
                </Alert>
            );
        }

        return (
            <Card className="shadow-lg rounded-lg p-4">
                <Button variant="outline-secondary" onClick={this.navigateToBlogList} className="mb-4 align-self-start">
                    ← Back to All Posts
                </Button>
                {blogPost.featured_image ? (
                    <Card.Img
                        variant="top"
                        src={blogPost.featured_image}
                        alt={blogPost.title}
                        style={{ maxHeight: '400px', objectFit: 'cover' }}
                        className="mb-4 rounded-lg"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://placehold.co/800x400/E0E7FF/4338CA?text=Image+Not+Found`;
                        }}
                    />
                ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center rounded-lg mb-4" style={{ height: '300px' }}>
                        <span className="text-muted">No Image</span>
                    </div>
                )}
                <Card.Body>
                    <Card.Title className="h2 fw-extrabold text-dark mb-3">
                        {blogPost.title}
                    </Card.Title>
                    <div className="text-muted small mb-4">
                        {blogPost.author && (
                            <span className="me-3">By <span className="fw-semibold">{blogPost.author.name || blogPost.author.email}</span></span>
                        )}
                        {blogPost.category && (
                            <span className="me-3">Category: <span className="fw-semibold">{blogPost.category.name}</span></span>
                        )}
                        {blogPost.published_date && (
                            <span>Published on: {new Date(blogPost.published_date).toLocaleDateString()}</span>
                        )}
                    </div>
                    <div
                        className="blog-content"
                        // Using dangerouslySetInnerHTML to render Markdown as HTML
                        // Ensure marked.js is loaded before this runs
                        dangerouslySetInnerHTML={{ __html: window.marked ? window.marked.parse(blogPost.content) : blogPost.content }}
                    />
                    {blogPost.tags && blogPost.tags.length > 0 && (
                        <div className="mt-5 pt-4 border-top border-light">
                            <h3 className="h5 fw-semibold text-dark mb-3">Tags:</h3>
                            <div className="d-flex flex-wrap gap-2">
                                {blogPost.tags.map(tag => (
                                    <span key={tag.id} className="badge bg-info text-dark rounded-pill px-3 py-2">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>
        );
    }

    render() {
        return (
            <Container className="my-5">
                {/* Custom CSS for markdown rendering and line-clamping */}
                <style>
                    {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                    body {
                        font-family: 'Inter', sans-serif;
                    }
                    .line-clamp-2 {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    .line-clamp-3 {
                        display: -webkit-box;
                        -webkit-line-clamp: 3;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    /* Basic Markdown styling for Bootstrap context */
                    .blog-content h1 { font-size: 2.5rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; }
                    .blog-content h2 { font-size: 2rem; font-weight: 700; margin-top: 1.8rem; margin-bottom: 0.8rem; }
                    .blog-content h3 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.6rem; }
                    .blog-content p { margin-bottom: 1rem; line-height: 1.6; }
                    .blog-content ul, .blog-content ol { margin-left: 1.5rem; margin-bottom: 1rem; }
                    .blog-content ul li { list-style-type: disc; }
                    .blog-content ol li { list-style-type: decimal; }
                    .blog-content li { margin-bottom: 0.5rem; }
                    .blog-content strong { font-weight: 700; }
                    .blog-content em { font-style: italic; }
                    .blog-content pre {
                        background-color: #f8f9fa;
                        border: 1px solid #e9ecef;
                        border-radius: 0.25rem;
                        padding: 1rem;
                        overflow-x: auto;
                    }
                    .blog-content code {
                        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                        font-size: 87.5%;
                        color: #e83e8c;
                        word-wrap: break-word;
                    }
                    .blog-content pre code {
                        color: inherit;
                    }
                    `}
                </style>
                <h1 className="text-center mb-5 fw-bold text-dark">Our Blog Posts</h1>
                {this.state.currentPage === 'list' ? this.renderBlogList() : this.renderBlogDetail()}
            </Container>
        );
    }
}

export default Blogs;