

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
    storeVendor: storeVendor,

    category: extractM2M(item.product_category, 'category_id')[0],
    materials: extractM2M(item.product_materials, 'material_id'),
    colors: extraData?.colors ?? extractM2M(item.product_colors, 'colors_id'),
    sizes: extraData?.sizes ?? extractM2M(item.product_sizes, 'sizes_id'),
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
        // Fetch nested vendor info from the store
        { product_store: ['id', 'store_name', 'store_slug', 'store_logo', { store_vendor: ['id', 'vendor_name', 'vendor_title'] }] },
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
 * Fetches a single product by its ID using a robust 2-step fetch for variants.
 */
export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    // Step 1: Fetch the main product data, which may only contain variant IDs.
    // FIX: Removed 'as any' cast to allow for proper TypeScript type inference by the Directus SDK.
    const productResult = await directus.request(readItem('products', Number(id), {
      fields: [
        '*',
        { product_store: ['id', 'store_name', 'store_slug', 'store_logo', { store_vendor: ['id', 'vendor_name', 'vendor_title'] }] },
        { product_category: [{ category_id: ['*'] }] },
        { product_materials: [{ material_id: ['*'] }] },
        { product_styles: [{ styles_id: ['*'] }] },
        { product_seasons: [{ seasons_id: ['*'] }] },
        { product_genders: [{ gender_id: ['*'] }] },
        { product_colors: [{ colors_id: ['*'] }] },
        { product_reels: [{ reels_id: ['id'] }] },
      ]
    })) as unknown as DirectusProduct;

    if (!productResult) return null;

    // Step 2: If we have variant IDs, fetch their full details separately.
    const colorIds = (productResult.product_colors || []).filter(c => typeof c === 'number') as number[];
    const sizeIds = (productResult.product_sizes || []).filter(s => typeof s === 'number') as number[];

    let colors: Color[] = [];
    if (colorIds.length > 0) {
      // FIX: Removed 'as any' cast to allow for proper TypeScript type inference by the Directus SDK.
      colors = await directus.request(readItems('colors', {
        filter: { id: { _in: colorIds } }
      })) as unknown as Color[];
    }

    let sizes: Size[] = [];
    if (sizeIds.length > 0) {
      // FIX: Removed 'as any' cast to allow for proper TypeScript type inference by the Directus SDK.
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