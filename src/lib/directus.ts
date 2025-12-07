import { createDirectus, rest, readItems, readSingleton, readItem } from '@directus/sdk';
import { 
  AppConfiguration, 
  Product, 
  Post, 
  Store, 
  BlogPost, 
  Season, 
  Style, 
  Material, 
  Gender, 
  Vendor, 
  Color, 
  Size,
  Category
} from '../types';

// 1. Define the Backend Database Schema
// This matches the RAW JSON response from your Directus API
interface DirectusProduct {
  id: number;
  status: string;
  product_name: string;
  product__description: string | null;
  product_overview: string | null;
  product_image: string;
  product_price: string;
  product_discount: string | null;
  product_instock: boolean;
  
  product_store: any; // Can be ID or Store object
  
  // M2M junction fields (will contain relational objects after deep fetch)
  product_category: { category_id: Category }[];
  product_materials: { material_id: Material }[];
  product_colors: { colors_id: Color }[];
  product_sizes: { sizes_id: Size }[];
  product_styles: { styles_id: Style }[];
  product_seasons: { seasons_id: Season }[];
  product_genders: { gender_id: Gender }[];
}

interface DirectusStore {
  id: number;
  status: string;
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
  category: Category[];
  seasons: Season[];
  styles: Style[];
  material: Material[];
  gender: Gender[];
  vendors: Vendor[];
  colors: Color[];
  sizes: Size[];
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
export const fetchAppConfiguration = async (): Promise<AppConfiguration> => {
  const config = await directus.request(readSingleton('configuration', {
    fields: ['*', 'app_logo']
  }));
  return config as AppConfiguration;
};

// Products
export const fetchProducts = async (filter?: any): Promise<Product[]> => {
  try {
    const result = await directus.request(readItems('products', {
      fields: [
        'id',
        'product_name',
        'product_price',
        'product_discount',
        'product_image',
        'product_instock',
        { product_store: ['id', 'store_name', 'store_slug', 'store_logo'] },
        { product_category: [{ category_id: ['*'] }] },
      ],
      filter: {
        status: { _eq: 'published' }, 
        ...filter
      },
      sort: ['-date_created'] as any
    }));
    
    return result.map(mapProductData);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const result = await directus.request(readItem('products', Number(id), {
      fields: [
        '*', 
        { product_store: ['id', 'store_name', 'store_slug', 'store_logo'] },
        { product_category: [{ category_id: ['*'] }] },
        { product_materials: [{ material_id: ['*'] }] },
        { product_colors: [{ colors_id: ['*'] }] },
        { product_sizes: [{ sizes_id: ['*'] }] },
        { product_styles: [{ styles_id: ['*'] }] },
        { product_seasons: [{ seasons_id: ['*'] }] },
        { product_genders: [{ gender_id: ['*'] }] },
      ]
    }));
    return mapProductData(result as DirectusProduct);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

// Stores
export const fetchStores = async (): Promise<Store[]> => {
  try {
    const result = await directus.request(readItems('stores', {
      fields: ['id', 'store_name', 'store_slug', 'store_logo'],
      filter: { status: { _eq: 'published' } as any }, 
      limit: 10 
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
         status: { _eq: 'published' } as any 
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

export const fetchSeasons = async (): Promise<Season[]> => {
  try {
    return await directus.request(readItems('seasons'));
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }
};

export const fetchStyles = async (): Promise<Style[]> => {
  try {
    return await directus.request(readItems('styles'));
  } catch (error) {
    console.error("Error fetching styles:", error);
    return [];
  }
};

export const fetchMaterials = async (): Promise<Material[]> => {
  try {
    return await directus.request(readItems('material'));
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
};

export const fetchGenders = async (): Promise<Gender[]> => {
  try {
    return await directus.request(readItems('gender'));
  } catch (error) {
    console.error("Error fetching genders:", error);
    return [];
  }
};

export const fetchVendors = async (): Promise<Vendor[]> => {
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

type CollectionName = 'seasons' | 'styles' | 'material' | 'gender' | 'vendors';
const categoryMeta: Record<CategoryType, { 
  collection: CollectionName; 
  slugField: string;                 
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
    const fieldsToFetch: (string | Record<string, any>)[] = ['id', '*'];
    if (type === 'vendor') {
      fieldsToFetch.push('vendor_stores');
    }

    const infoResult = await directus.request(readItems(meta.collection, {
      fields: fieldsToFetch as any,
      filter: { [meta.slugField]: { _eq: filterValue } } as any,
      limit: 1,
    }));
    const info = infoResult[0] || null;
    
    if (!info) {
      console.warn(`No category info found for ${type} with slug ${slug}`);
      return { info: null, products: [] };
    }

    let productFilter: any;

    if (type === 'vendor') {
      const vendorInfo = info as unknown as Vendor;
      const storeIds = vendorInfo.vendor_stores || [];
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

    const productsResult = await fetchProducts(productFilter);

    return { info, products: productsResult };
  } catch (error) {
    console.error(`Error fetching data for category ${type} with slug ${slug}:`, error);
    throw error;
  }
};


// --- Data Mappers ---

// FIX: Updated function signature to accept Partial<DirectusStore> to resolve build errors.
// This accurately reflects that list views fetch only a subset of fields.
const mapStoreData = (item: Partial<DirectusStore>): Store => {
  return {
    id: String(item.id!),
    name: item.store_name!,
    title: item.store_title || undefined,
    handle: `@${item.store_slug!}`,
    slug: item.store_slug!,
    avatar: getAssetUrl(item.store_logo!),
    coverImage: 'https://picsum.photos/800/300?random=' + item.id, // placeholder
    followers: 12500, // mock
    isFollowing: false, // mock
    description: item.store_description || 'اطلاعات فروشگاه به زودی تکمیل می‌شود.',
    productIds: item.store_products || [],
    
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

// FIX: Updated function signature to accept Partial<DirectusProduct> to resolve build errors.
// This makes the function compatible with both full (detail) and partial (list) API responses.
const mapProductData = (item: Partial<DirectusProduct>): Product => {
  // Use non-null assertions (!) for fields guaranteed to be present in list views.
  const price = Number(item.product_price! || 0);
  const finalPrice = Number(item.product_discount || price);
  
  let discountPercentage: number | undefined = undefined;
  if (item.product_price && price > 0 && finalPrice < price) {
    discountPercentage = Math.round(((price - finalPrice) / parseFloat(item.product_price)) * 100);
  }

  const storeData = item.product_store;
  const storeId = typeof storeData === 'object' && storeData !== null ? String(storeData.id) : String(storeData);
  const storeName = typeof storeData === 'object' && storeData !== null ? storeData.store_name : undefined;
  const storeSlug = typeof storeData === 'object' && storeData !== null ? storeData.store_slug : undefined;
  const storeAvatar = typeof storeData === 'object' && storeData !== null ? getAssetUrl(storeData.store_logo) : 'https://placehold.co/100?text=Store';

  // Helper to safely extract nested M2M data from junction tables.
  const extractM2M = (junctions: any[] | undefined, key: string): any[] => {
    if (!Array.isArray(junctions)) return [];
    return junctions.map(j => j[key]).filter(Boolean);
  };

  return {
    id: String(item.id!),
    name: item.product_name!,
    description: item.product__description || null,
    overview: item.product_overview || null,
    image: getAssetUrl(item.product_image!),
    
    price: price,
    finalPrice: finalPrice,
    discountPercentage: discountPercentage,
    
    inStock: item.product_instock!,
    
    storeId: storeId!,
    storeName: storeName,
    storeSlug: storeSlug,
    storeAvatar: storeAvatar,
    
    category: extractM2M(item.product_category, 'category_id')[0],
    materials: extractM2M(item.product_materials, 'material_id'),
    colors: extractM2M(item.product_colors, 'colors_id'),
    sizes: extractM2M(item.product_sizes, 'sizes_id'),
    styles: extractM2M(item.product_styles, 'styles_id'),
    seasons: extractM2M(item.product_seasons, 'seasons_id'),
    genders: extractM2M(item.product_genders, 'gender_id'),
  };
};