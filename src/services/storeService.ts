

import { readItems } from '@directus/sdk';
import { directus, getAssetUrl } from './client';
import { Store, Product, Vendor } from '../types';
import { DirectusStore } from '../types/directus';
import { fetchProducts } from './productService';

// --- Data Mapper ---

/**
 * Transforms a raw DirectusStore object into a clean, frontend-friendly Store object.
 * Accepts partial data from list views.
 */
const mapStoreData = (item: Partial<DirectusStore>): Store => {
  // Handle store_reels: can be number[] (O2M) or { reels_id: number }[] (M2M)
  let reelIds: number[] = [];
  if (Array.isArray(item.store_reels)) {
    reelIds = item.store_reels.map((r: any) => {
      if (typeof r === 'number') return r;
      if (typeof r === 'object' && r !== null && r.reels_id) return r.reels_id;
      return null;
    }).filter((id): id is number => id !== null);
  }

  // Ensure store_vendor is treated correctly if it's an object (expanded)
  const vendor = (typeof item.store_vendor === 'object' && item.store_vendor !== null) 
    ? (item.store_vendor as Vendor) 
    : undefined;

  return {
    id: String(item.id!),
    name: item.store_name!,
    title: item.store_title || undefined,
    handle: `@${item.store_slug!}`,
    slug: item.store_slug!,
    avatar: getAssetUrl(item.store_logo!),
    coverImage: item.store_cover ? getAssetUrl(item.store_cover) : undefined,
    coverColor: item.store_color || undefined,
    followers: 12500, // mock
    isFollowing: false, // mock
    description: item.store_description || 'اطلاعات فروشگاه به زودی تکمیل می‌شود.',
    productIds: item.store_products || [],
    reelIds: reelIds,
    vendor: vendor, // Map the vendor
    
    channel: item.store_channel || undefined,
    instagram: item.store_instagram || undefined,
    website: item.store_website || undefined,
    whatsapp: item.store_whatsapp || undefined,
    phone: item.store_phone || undefined,
    mobile: item.store_mobile || undefined,
    address: item.store_address || undefined,
    telegram: item.store_telegram || undefined,
  };
};


// --- API Functions ---

/**
 * Fetches a list of published stores (optimized for list views).
 */
export const fetchStores = async (): Promise<Store[]> => {
  try {
    // FIX: Removed 'as any' casts to allow for proper TypeScript type inference by the Directus SDK.
    const result = await directus.request(readItems('stores', {
      fields: [
        'id', 
        'store_name', 
        'store_slug', 
        'store_logo', 
        'store_reels', 
        'store_cover', 
        'store_color',
        // Fetch expanded vendor details
        { store_vendor: ['id', 'vendor_name', 'vendor_title', 'vendor_color'] }
      ],
      filter: { status: { _eq: 'published' } },
      limit: 10
    })) as unknown as DirectusStore[];
    return result.map(item => mapStoreData(item));
  } catch (error) {
    console.error("Error fetching stores:", error);
    return [];
  }
};

/**
 * Fetches a single store and its associated products by its slug.
 */
export const fetchStoreBySlug = async (slug: string): Promise<{ store: Store | null; products: Product[] }> => {
  try {
    // FIX: Removed 'as any' casts to allow for proper TypeScript type inference by the Directus SDK.
    const storeResults = await directus.request(readItems('stores', {
      fields: [
        '*', 
        'store_reels',
        // Fetch expanded vendor details
        { store_vendor: ['id', 'vendor_name', 'vendor_title', 'vendor_color'] }
      ],
      filter: {
        store_slug: { _eq: slug },
        status: { _eq: 'published' }
      },
      limit: 1,
    })) as unknown as DirectusStore[];
    const storeResult = storeResults[0];

    if (!storeResult) {
      return { store: null, products: [] };
    }

    const mappedStore = mapStoreData(storeResult);

    // Optimized: Do not fetch reels relation products here. 
    // We only fetch the main products relation.
    let products: Product[] = [];
    if (mappedStore.productIds && mappedStore.productIds.length > 0) {
      products = await fetchProducts({
        id: { _in: mappedStore.productIds },
      });
    }

    return { store: mappedStore, products };

  } catch (error) {
    console.error(`Error fetching store with slug ${slug}:`, error);
    return { store: null, products: [] };
  }
};
