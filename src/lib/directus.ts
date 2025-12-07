



import { createDirectus, rest, readItems, readSingleton, readItem } from '@directus/sdk';
import { AppConfiguration, Product, Post, Store, BlogPost, Season, Style, Material, Gender, Vendor } from '../types';

// 1. Define the Backend Database Schema
// This matches the RAW JSON response from your Directus API
interface DirectusProduct {
  id: number;
  status: string;
  product_name: string;
  product__description: string | null;
  product_image: string; // UUID
  product_price: string | null;
  product_discount: string | null;
  category: string[]; // ["hoodies"]
  product_store?: any; 
  
  // Specific color structure from backend
  color?: { avaible_colors: string }[]; 
  size?: string[];
  
  // Relations/Other
  variants?: number[];
  
  // M2M fields from JSON response
  product_seasons?: number[];
  product_styles?: number[];
  product_materials?: number[];
  product_genders?: number[];
}

interface DirectusStore {
  id: number;
  store_name: string;
  store_title?: string | null;
  store_description: string | null;
  store_logo: string;
  store_slug: string;
  store_products: number[];

  // New Contact/Social Fields
  store_channel?: string;
  store_instagram?: string;
  store_website?: string;
  store_whatsapp?: string;
  store_phone?: string;
  store_mobile?: string;
  store_address?: string;
  store_telegram?: string;
}

export interface DirectusSchema {
  configuration: AppConfiguration;
  products: DirectusProduct[];
  stores: DirectusStore[];
  posts: Post[];
  blog_posts: BlogPost[];
  
  // Filter Collections
  seasons: Season[];
  styles: Style[];
  material: Material[];
  gender: Gender[];
  vendors: Vendor[];
  
  [key: string]: any; 
}

const CRM_URL = 'https://crm.tankhor.com';

// 2. Initialize the Client
export const directus = createDirectus<DirectusSchema>(CRM_URL)
  .with(rest());

// 3. Image Helper
export const getAssetUrl = (id: string | undefined) => {
  if (!id) return 'https://placehold.co/400?text=No+Image';
  if (id.startsWith('http')) return id;
  return `${CRM_URL}/assets/${id}`;
};

// --- API Helpers ---

// Configuration
export const fetchAppConfiguration = async () => {
  return await directus.request(readSingleton('configuration'));
};

// Products
export const fetchProducts = async (filter?: any) => {
  try {
    const result = await directus.request(readItems('products', {
      fields: ['*', 'product_store.id', 'product_store.store_name', 'product_store.store_slug', 'product_store.store_logo'],
      filter: {
        status: { _eq: 'published' }, // Only show published items
        ...filter
      },
      sort: ['-date_created'] as any
    }));
    
    // Map raw backend data to frontend interface
    return result.map(mapProductData);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const fetchProductById = async (id: string) => {
  try {
    const result = await directus.request(readItem('products', Number(id), {
      fields: ['*', 'product_store.id', 'product_store.store_name', 'product_store.store_slug', 'product_store.store_logo']
    }));
    return mapProductData(result);
  } catch (error)
 {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

// Stores
export const fetchStores = async (): Promise<Store[]> => {
  try {
    const result = await directus.request(readItems('stores', {
      fields: ['id', 'store_name', 'store_slug', 'store_logo'],
      filter: { status: { _eq: 'published' } },
      limit: 10 // Limit for stories bar
    }));
    return result.map(mapStoreData);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return [];
  }
};

export const fetchStoreBySlug = async (slug: string): Promise<{ store: Store | null; products: Product[] }> => {
  try {
    const storeResults = await directus.request(readItems('stores', {
       fields: ['*'],
       filter: { 
         store_slug: { _eq: slug },
         status: { _eq: 'published' }
       },
       limit: 1,
    }));
    const storeResult = storeResults[0];

    if (!storeResult) {
      return { store: null, products: [] };
    }
    
    const mappedStore = mapStoreData(storeResult);

    let products: Product[] = [];
    if (mappedStore.productIds && mappedStore.productIds.length > 0) {
      products = await fetchProducts({
        id: { _in: mappedStore.productIds }
      });
    }

    return { store: mappedStore, products };

  } catch (error) {
    console.error(`Error fetching store with slug ${slug}:`, error);
    return { store: null, products: [] };
  }
};


// --- Filter Collections Fetchers ---

export const fetchSeasons = async () => {
  try {
    return await directus.request(readItems('seasons'));
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }
};

export const fetchStyles = async () => {
  try {
    return await directus.request(readItems('styles'));
  } catch (error) {
    console.error("Error fetching styles:", error);
    return [];
  }
};

export const fetchMaterials = async () => {
  try {
    return await directus.request(readItems('material'));
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
};

export const fetchGenders = async () => {
  try {
    return await directus.request(readItems('gender'));
  } catch (error) {
    console.error("Error fetching genders:", error);
    return [];
  }
};

export const fetchVendors = async () => {
  try {
    return await directus.request(readItems('vendors', { fields: ['*'] }));
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }
};


// --- SEO Category Page Fetcher ---

export type CategoryType = 'season' | 'style' | 'material' | 'gender' | 'vendor';

const fromSlug = (slug: string) => slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

// This metadata drives the filtering logic.
const categoryMeta: Record<CategoryType, { 
  collection: keyof DirectusSchema; 
  slugField: string;                 
  // M2M fields, not applicable to vendor
  productField?: string;
  junctionFK?: string;
}> = {
  season:   { collection: 'seasons',  slugField: 'season_name',   productField: 'product_seasons',   junctionFK: 'seasons_id' },
  style:    { collection: 'styles',   slugField: 'style_name',    productField: 'product_styles',    junctionFK: 'styles_id' },
  material: { collection: 'material', slugField: 'material_name', productField: 'product_materials', junctionFK: 'material_id' },
  gender:   { collection: 'gender',   slugField: 'gender_name',   productField: 'product_genders',   junctionFK: 'gender_id' },
  vendor:   { collection: 'vendors',  slugField: 'vendor_title' },
};

export const fetchCategoryInfoAndProducts = async (type: CategoryType, slug: string) => {
  const meta = categoryMeta[type];
  if (!meta) throw new Error(`Invalid category type: ${type}`);

  const filterValue = type === 'gender' ? slug.toLowerCase() : fromSlug(slug);

  try {
    // 1. Fetch category/vendor info to get its ID and related IDs
    const infoResult = await directus.request(readItems(meta.collection, {
      fields: ['id', '*', 'vendor_stores'],
      filter: { [meta.slugField]: { _eq: filterValue } },
      limit: 1,
    }));
    const info = infoResult[0] || null;
    
    if (!info) {
      console.warn(`No category info found for ${type} with slug ${slug}`);
      return { info: null, products: [] };
    }

    // 2. Build the correct filter for products based on the relationship
    let productFilter: any;

    if (type === 'vendor') {
      const storeIds = info.vendor_stores || [];
      if (storeIds.length === 0) {
        return { info, products: [] };
      }
      
      productFilter = {
        'product_store': {
          'id': { 
            '_in': storeIds
          }
        }
      };
    } else {
      // Standard M2M logic for other types (e.g., seasons, styles)
      if (!meta.productField || !meta.junctionFK) {
         throw new Error(`M2M metadata missing for type: ${type}`);
      }
      productFilter = {
        [meta.productField]: {
          [meta.junctionFK]: {
            'id': {
              '_eq': info.id
            }
          }
        }
      };
    }

    // 3. Fetch products using the correct filter
    const productsResult = await directus.request(readItems('products', {
      fields: ['*', 'product_store.id', 'product_store.store_name', 'product_store.store_slug', 'product_store.store_logo'],
      filter: {
        status: { _eq: 'published' },
        ...productFilter
      },
      sort: ['-date_created'] as any
    }));

    return { info, products: productsResult.map(mapProductData) };
  } catch (error) {
    console.error(`Error fetching data for category ${type} with slug ${slug}:`, error);
    throw error;
  }
};


// --- Data Mappers ---

const mapStoreData = (item: DirectusStore): Store => {
  return {
    id: String(item.id),
    name: item.store_name,
    title: item.store_title || undefined,
    handle: `@${item.store_slug}`,
    slug: item.store_slug,
    avatar: getAssetUrl(item.store_logo),
    coverImage: 'https://picsum.photos/800/300?random=' + item.id, // placeholder
    followers: 12500, // mock
    isFollowing: false, // mock
    description: item.store_description || 'اطلاعات فروشگاه به زودی تکمیل می‌شود.',
    productIds: item.store_products || [],
    
    // Map new contact fields
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

// Transforms Backend Schema (DirectusProduct) -> Frontend Schema (Product)
const mapProductData = (item: DirectusProduct): Product => {
  let discountPercentage = 0;
  const price = Number(item.product_price || 0);
  const discountPrice = Number(item.product_discount || 0);

  if (price > 0 && discountPrice > 0 && discountPrice < price) {
    discountPercentage = Math.round(((price - discountPrice) / price) * 100);
  }

  const mappedColors = item.color?.map((c, index) => ({
    name: `Color ${index + 1}`,
    hex: c.avaible_colors
  })) || [];

  const storeData = item.product_store;
  const storeId = typeof storeData === 'object' && storeData !== null ? String(storeData.id) : String(storeData);
  const storeName = typeof storeData === 'object' && storeData !== null ? storeData.store_name : undefined;
  const storeSlug = typeof storeData === 'object' && storeData !== null ? storeData.store_slug : undefined;
  const storeAvatar = typeof storeData === 'object' && storeData !== null ? getAssetUrl(storeData.store_logo) : 'https://placehold.co/100?text=Store';

  return {
    id: String(item.id),
    name: item.product_name,
    price: price,
    discount: discountPercentage,
    image: getAssetUrl(item.product_image),
    gallery: [getAssetUrl(item.product_image)], 
    category: item.category?.[0] || 'Uncategorized',
    storeId: storeId,
    storeName: storeName,
    storeSlug: storeSlug,
    storeAvatar: storeAvatar,
    description: item.product__description || '',
    stock: 10,
    availability: 'In Stock',
    colors: mappedColors,
    sizes: item.size || [],
    details: {}
  };
};