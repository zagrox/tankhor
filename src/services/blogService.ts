
import { readItems } from '@directus/sdk';
import { directus, getAssetUrl } from './client';
import { BlogPost } from '../types';
import { DirectusBlog } from '../types/directus';

const mapBlogData = (item: DirectusBlog): BlogPost => {
  return {
    id: String(item.id),
    title: item.blog_title,
    excerpt: item.blog_summary,
    content: item.blog_content,
    slug: item.blog_slug,
    date: new Date(item.date_created).toLocaleDateString('fa-IR'),
    image: getAssetUrl(item.blog_image),
  };
};

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const result = await directus.request(readItems('blogs', {
      filter: { status: { _eq: 'published' } },
      sort: ['-date_created']
    })) as unknown as DirectusBlog[];

    return result.map(mapBlogData);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
};

export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const result = await directus.request(readItems('blogs', {
      filter: { 
        status: { _eq: 'published' },
        blog_slug: { _eq: slug }
      },
      limit: 1
    })) as unknown as DirectusBlog[];

    if (result.length === 0) return null;
    return mapBlogData(result[0]);
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    return null;
  }
};
