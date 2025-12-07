import React from 'react';
import { MOCK_BLOGS } from '../constants';
import { ChevronLeft, Clock } from 'lucide-react';

const Blog: React.FC = () => {
  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1 className="blog-main-title">مجله تن‌خور</h1>
        <p className="blog-subtitle">جدیدترین اخبار مد، ترندهای فصل و راهنمای استایل</p>
      </div>

      <div className="blog-grid">
        {MOCK_BLOGS.map(post => (
          <article key={post.id} className="article-card">
            <div className="article-image-box">
              <img src={post.image} alt={post.title} className="article-img" />
              <div className="article-date-badge">
                {post.date}
              </div>
            </div>
            <div className="article-content">
              <h2 className="article-title">{post.title}</h2>
              <p className="article-excerpt">{post.excerpt}</p>
              
              <div className="article-footer">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>۵ دقیقه مطالعه</span>
                </div>
                <span className="read-more">
                  ادامه مطلب
                  <ChevronLeft size={16} />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;