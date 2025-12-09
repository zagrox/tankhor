
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { fetchBlogPostBySlug } from '../services/blogService';
import { BlogPost } from '../types';
import { ArrowRight, Calendar, AlertCircle } from 'lucide-react';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { setIsLoading, isLoading } = useAppContext();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchBlogPostBySlug(slug);
        if (data) {
          setPost(data);
        } else {
          setError('مقاله مورد نظر یافت نشد.');
        }
      } catch (err) {
        console.error(err);
        setError('خطا در بارگذاری مقاله.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [slug, setIsLoading]);

  /**
   * Parses "dirty" Markdown/Text from n8n and converts it to semantic HTML.
   * Handles: **Bold**, ### Headers, 1. Ordered Lists, - Unordered Lists.
   */
  const formatContent = (content: string) => {
    if (!content) return '';

    // 1. Handle Bold (**text**) globally first
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 2. Split into lines to handle block elements
    const lines = formatted.split('\n');
    let html = '';
    let inOrderedList = false;
    let inUnorderedList = false;

    const closeLists = () => {
      if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
      if (inUnorderedList) { html += '</ul>'; inUnorderedList = false; }
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        closeLists();
        return; 
      }

      // Headers (### or ##)
      if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
        closeLists();
        const level = trimmed.startsWith('###') ? 3 : 2;
        const text = trimmed.replace(/^#+\s*/, ''); // Remove hashtags
        html += `<h${level}>${text}</h${level}>`;
      }
      // Ordered List (1. item)
      else if (/^\d+\./.test(trimmed)) {
        if (!inOrderedList) {
          closeLists(); // Close ul if open
          html += '<ol>';
          inOrderedList = true;
        }
        const text = trimmed.replace(/^\d+\.\s*/, '');
        html += `<li>${text}</li>`;
      }
      // Unordered List (* item or - item)
      else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        if (!inUnorderedList) {
          closeLists(); // Close ol if open
          html += '<ul>';
          inUnorderedList = true;
        }
        const text = trimmed.replace(/^[\*\-]\s*/, '');
        html += `<li>${text}</li>`;
      }
      // Regular Paragraph
      else {
        closeLists();
        html += `<p>${trimmed}</p>`;
      }
    });

    closeLists(); // Close any remaining lists
    return html;
  };

  if (isLoading) return null;

  if (error || !post) {
    return (
      <div className="blog-error-container">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2>{error || "مقاله یافت نشد"}</h2>
        <Link to="/blog" className="btn-back-blog">بازگشت به وبلاگ</Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        {/* Navigation */}
        <div className="blog-nav">
          <Link to="/blog" className="back-link">
            <ArrowRight size={20} />
            بازگشت به لیست مقالات
          </Link>
        </div>

        {/* Header */}
        <header className="blog-detail-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <div className="meta-item">
              <Calendar size={16} />
              <span>{post.date}</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="post-featured-image">
          <img src={post.image} alt={post.title} />
        </div>

        {/* Content */}
        <div className="post-content-wrapper">
          <div 
            className="post-content"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
