

import { readItems, readItem } from '@directus/sdk';
import { directus, getAssetUrl } from './client';
import { Product, Color, Size, Vendor } from '../types';
import { DirectusProduct } from '../types/directus';

// --- Data Mapper ---

/**
 * Transforms a raw DirectusProduct object into a clean, frontend-friendly Product object.
 * Accepts partial data from list views and optional extra data for variants.
 */
const mapProductData = (item: Partial<DirectusProduct>, extraData?: { colors?: Color[]; sizes?: Size[] }): Product => {
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
  const storeColor = typeof storeData === 'object' && storeData !== null ? storeData.store_color : undefined;
  const storeVendor = (typeof storeData === 'object' && storeData !== null) ? (storeData.store_vendor as Vendor | undefined) : undefined;
  
  // Helper to safely extract M2M data
  const extractM2M = (junctions: any[] | undefined | null, key: string): any[] => {
    if (!Array.isArray(junctions) || junctions.length === 0) return [];
    if (typeof junctions[0] === 'object' && junctions[0] !== null) {
      return junctions.map((j) => j[key]).filter(Boolean);
    }
    return [];
  };

  const relatedReelIds = extractM2M(item.product_reels, 'reels_id').map((r: any) => r.id);

  // FIX: Logic for Colors/Sizes: Use extraData ONLY if it has items.
  // Otherwise try to extract from the item itself (if expanded).
  const colors = (extraData?.colors && extraData.colors.length > 0) 
    ? extraData.colors 
    : extractM2M(item.product_colors, 'colors_id');

  const sizes = (extraData?.sizes && extraData.sizes.length > 0)
    ? extraData.sizes
    : extractM2M(item.product_sizes, 'sizes_id');

  return {
    id: String(item.id!),
    name: item.product_name!,
    description: item.product_description || null, // Updated field name
    overview: item.product_overview || null,
    image: getAssetUrl(item.product_image!),

    price: price,
    finalPrice: finalPrice,
    discountPercentage: discountPercentage,

    inStock: item.product_instock!,
    weight: item.product_weight || undefined,

    storeId: storeId!,
    storeName: storeName,
    storeSlug: storeSlug,
    storeAvatar: storeAvatar,
    storeColor: storeColor, // Map store color
    storeVendor: storeVendor,

    category: extractM2M(item.product_category, 'category_id')[0],
    materials: extractM2M(item.product_materials, 'material_id'),
    colors: colors,
    sizes: sizes,
    styles: extractM2M(item.product_styles, 'styles_id'),
    seasons: extractM2M(item.product_seasons, 'seasons_id'),
    genders: extractM2M(item.product_genders, 'gender_id'),
    relatedReelIds: relatedReelIds,
  };
};


// --- API Functions ---

/**
 * Fetches a list of published products.
 */
export const fetchProducts = async (filter?: any): Promise<Product[]> => {
  try {
    // FIX: Removed 'as any' casts to allow for proper TypeScript type inference by the Directus SDK.
    const result = await directus.request(readItems('products', {
      fields: [
        'id',
        'product_name',
        'product_price',
        'product_discount',
        'product_image',
        'product_instock',
        'product_weight',
        // Fetch nested vendor info from the store
        { product_store: ['id', 'store_name', 'store_slug', 'store_logo', 'store_color', { store_vendor: ['id', 'vendor_name', 'vendor_title'] }] },
        { product_category: [{ category_id: ['*'] }] },
        { product_seasons: [{ seasons_id: ['*'] }] },
        { product_styles: [{ styles_id: ['*'] }] },
        { product_materials: [{ material_id: ['*'] }] },
        { product_genders: [{ gender_id: ['*'] }] },
        { product_colors: [{ colors_id: ['*'] }] },
        { product_reels: [{ reels_id: ['id'] }] }, // Fetch related reel IDs
      ],
      filter: {
        status: { _eq: 'published' },
        ...filter
      },
      sort: ['-date_created']
    })) as unknown as DirectusProduct[];

    return result.map(item => mapProductData(item));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

/**
 * Helper to extract IDs from mixed content (numbers, junction objects, or expanded objects)
 */
const extractIds = (items: any[], key: string): number[] => {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item: any) => {
    // 1. If it's already a number (flat ID)
    if (typeof item === 'number') return item;
    
    // 2. If it's an object
    if (typeof item === 'object' && item !== null) {
      // 2a. Check for junction key (e.g. colors_id)
      if (key in item) {
        const target = item[key];
        if (typeof target === 'number') return target;
        if (typeof target === 'object' && target !== null && target.id) return target.id;
      }
      // 2b. Fallback: maybe the item itself is the object with an id (if mapping was already done partially)
      if (item.id) return item.id;
    }
    return null;
  }).filter((id): id is number => typeof id === 'number');
};

/**
 * Fetches a single product by its ID using a robust 2-step fetch for variants.
 */
export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    // Step 1: Fetch the main product data.
    // We try to fetch expanded fields immediately.
    const productResult = await directus.request(readItem('products', Number(id), {
      fields: [
        '*',
        { product_store: ['id', 'store_name', 'store_slug', 'store_logo', 'store_color', { store_vendor: ['id', 'vendor_name', 'vendor_title'] }] },
        { product_category: [{ category_id: ['*'] }] },
        { product_materials: [{ material_id: ['*'] }] },
        { product_styles: [{ styles_id: ['*'] }] },
        { product_seasons: [{ seasons_id: ['*'] }] },
        { product_genders: [{ gender_id: ['*'] }] },
        { product_colors: [{ colors_id: ['*'] }] },
        { product_sizes: [{ sizes_id: ['*'] }] },
        { product_reels: [{ reels_id: ['id'] }] },
      ]
    })) as unknown as DirectusProduct;

    if (!productResult) return null;

    // Step 2: Handle cases where expansion didn't return objects but just IDs or junction objects with IDs
    // This makes it robust against permissions issues or API config where depth is limited.
    const colorIds = extractIds(productResult.product_colors || [], 'colors_id');
    const sizeIds = extractIds(productResult.product_sizes || [], 'sizes_id');

    let colors: Color[] = [];
    if (colorIds.length > 0) {
      colors = await directus.request(readItems('colors', {
        filter: { id: { _in: colorIds } }
      })) as unknown as Color[];
    }

    let sizes: Size[] = [];
    if (sizeIds.length > 0) {
      sizes = await directus.request(readItems('sizes', {
        filter: { id: { _in: sizeIds } }
      })) as unknown as Size[];
    }

    // Step 3: Pass the complete data to the mapper.
    return mapProductData(productResult, { colors, sizes });

  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};
