

import { readItems } from '@directus/sdk';
import { directus } from './client';
import { Season, Style, Material, Gender, Vendor, Category, Color } from '../types';
import { fetchProducts } from './productService';

// --- Simple Filter Collection Fetchers ---

export const fetchSeasons = async (): Promise<Season[]> => {
  try {
    // FIX: Removed 'as any' cast to allow for proper TypeScript type inference by the Directus SDK.
    return await directus.request(readItems('seasons')) as unknown as Season[];
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }
};

export const fetchStyles = async (): Promise<Style[]> => {
  try {
    // FIX: Removed 'as any' cast to allow for proper TypeScript type inference by the Directus SDK.
    return await directus.request(readItems('styles')) as unknown as Style[];
  } catch (error) {
    console.error("Error fetching styles:", error);
    return [];
  }
};

export const fetchMaterials = async (): Promise<Material[]> => {
  try {
    // FIX: Removed 'as any' cast to allow for proper TypeScript type inference by the Directus SDK.
    return await directus.request(readItems('material')) as unknown as Material[];
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
};

export const fetchGenders = async (): Promise<Gender[]> => {
  try {
    // FIX: Removed 'as any' cast to allow for proper TypeScript type inference by the Directus SDK.
    return await directus.request(readItems('gender')) as unknown as Gender[];
  } catch (error) {
    console.error("Error fetching genders:", error);
    return [];
  }
};

export const fetchVendors = async (): Promise<Vendor[]> => {
  try {
    // FIX: Removed 'as any' cast to allow for proper TypeScript type inference by the Directus SDK.
    return await directus.request(readItems('vendors', { fields: ['*'] })) as unknown as Vendor[];
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }
};

export const fetchColors = async (): Promise<Color[]> => {
  try {
    // FIX: Removed 'as any' cast to allow for proper TypeScript type inference by the Directus SDK.
    return await directus.request(readItems('colors', { fields: ['*'], limit: -1 })) as unknown as Color[];
  } catch (error) {
    console.error("Error fetching colors:", error);
    return [];
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    // FIX: Removed 'as any' casts to allow for proper TypeScript type inference by the Directus SDK.
    return await directus.request(readItems('category', { sort: ['category_parent', 'category_name'] })) as unknown as Category[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};


// --- Complex Category Page Fetcher ---

export type CategoryType = 'season' | 'style' | 'material' | 'gender' | 'vendor' | 'category';

type CollectionName = 'seasons' | 'styles' | 'material' | 'gender' | 'vendors' | 'category';

// Metadata to map URL types to Directus collection and field names
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
  category: { collection: 'category', slugField: 'category_name', productField: 'product_category',  junctionFK: 'category_id' },
  vendor:   { collection: 'vendors',  slugField: 'vendor_title' },
};

const fromSlug = (slug: string) => slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

/**
 * Fetches the details for a specific category and all products belonging to it.
 */
export const fetchCategoryInfoAndProducts = async (type: CategoryType, slug: string) => {
  const meta = categoryMeta[type];
  if (!meta) throw new Error(`Invalid category type: ${type}`);

  // For most types, we transform slug to Title Case. For 'category', we need to match the Persian name.
  const filterValue = (type === 'gender' || type === 'category') ? slug : fromSlug(slug);

  try {
    const fieldsToFetch: (string | Record<string, any>)[] = ['id', '*'];
    if (type === 'vendor') {
      fieldsToFetch.push('vendor_stores');
    }

    // FIX: Cast fieldsToFetch to any to bypass complex union type mismatch with Directus SDK QueryFields.
    const infoResult = await directus.request(readItems(meta.collection, {
      fields: fieldsToFetch as any,
      filter: { [meta.slugField]: { _eq: filterValue } },
      limit: 1,
    })) as unknown as any[];
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
      productFilter = { 'product_store': { 'id': { '_in': storeIds } } };
    } else {
      if (!meta.productField || !meta.junctionFK) {
        throw new Error(`M2M metadata missing for type: ${type}`);
      }
      productFilter = {
        [meta.productField]: { [meta.junctionFK]: { 'id': { '_eq': info.id } } }
      };
    }

    const productsResult = await fetchProducts(productFilter);

    return { info, products: productsResult };
  } catch (error) {
    console.error(`Error fetching data for category ${type} with slug ${slug}:`, error);
    throw error;
  }
};