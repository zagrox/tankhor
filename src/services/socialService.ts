
import { readItems } from '@directus/sdk';
import { directus, getAssetUrl } from './client';
import { Reel } from '../types';

export const fetchReels = async (page = 1, limit = 5): Promise<Reel[]> => {
  try {
    const result = await directus.request(readItems('reels', {
      fields: [
        'id',
        'reel_caption',
        // Expand reel_file to get metadata like type
        { reel_file: ['id', 'type'] },
        'reel_like',
        'date_created',
        // Expand the store relation
        { reel_store: ['id', 'store_name', 'store_slug', 'store_logo'] }
      ],
      filter: { status: { _eq: 'published' } },
      sort: ['-date_created'],
      limit: limit,
      page: page
    })) as unknown as any[];

    return result.map((item: any) => {
      // Handle the expanded file object or fallback if it's just an ID (though we requested expansion)
      const fileData = item.reel_file;
      const fileId = typeof fileData === 'object' && fileData !== null ? fileData.id : fileData;
      const fileType = typeof fileData === 'object' && fileData !== null ? fileData.type : 'image/jpeg';

      return {
        id: item.id,
        // Strip HTML tags from caption if present (assuming Directus WYSIWYG might output HTML)
        caption: item.reel_caption?.replace(/<[^>]*>/g, '') || '', 
        media: getAssetUrl(fileId),
        mimeType: fileType,
        likes: item.reel_like || 0,
        date: item.date_created,
        store: {
          id: String(item.reel_store?.id),
          name: item.reel_store?.store_name || 'فروشگاه',
          slug: item.reel_store?.store_slug || '',
          avatar: getAssetUrl(item.reel_store?.store_logo),
          handle: item.reel_store?.store_slug ? `@${item.reel_store.store_slug}` : '',
          coverImage: 'https://picsum.photos/800/300?random=' + (item.reel_store?.id || 0),
        }
      };
    });
  } catch (error) {
    console.error("Error fetching reels:", error);
    return [];
  }
};
