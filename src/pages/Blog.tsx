
import React, { useEffect, useState } from 'react';
import { fetchBlogPosts } from '../services/blogService';
import { BlogPost } from '../types';
import { ChevronLeft, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const Blog: React.FC = () => {
  const { setIsLoading, isLoading } = useAppContext();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchBlogPosts();
        setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [setIsLoading]);

  if (isLoading) return null;

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1 className="blog-main-title">مجله تن‌خور</h1>
        <p className="blog-subtitle">جدیدترین اخبار مد، ترندهای فصل و راهنمای استایل</p>
      </div>

      <div className="blog-grid">
        {posts.map(post => (
          <article key={post.id} className="article-card">
            <Link to={`/blog/${post.slug}`} className="article-image-box">
              <img src={post.image} alt={post.title} className="article-img" />
              <div className="article-date-badge">
                {post.date}
              </div>
            </Link>
            <div className="article-content">
              <Link to={`/blog/${post.slug}`}>
                <h2 className="article-title">{post.title}</h2>
              </Link>
              <p className="article-excerpt">{post.excerpt}</p>
              
              <div className="article-footer">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>۵ دقیقه مطالعه</span>
                </div>
                <Link to={`/blog/${post.slug}`} className="read-more">
                  ادامه مطلب
                  <ChevronLeft size={16} />
                </Link>
              </div>
            </div>
          </article>
        ))}
        {posts.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            هنوز مقاله‌ای منتشر نشده است.
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
