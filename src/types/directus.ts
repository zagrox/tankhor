import {
  AppConfiguration,
  Post,
  BlogPost,
  Season,
  Style,
  Material,
  Gender,
  Vendor,
  Color,
  Size,
  Category,
} from '../types';

// This file contains the RAW type definitions that match the Directus API response.

export interface DirectusProduct {
  id: number;
  status: string;
  date_created?: string; // Standard Directus field
  product_name: string;
  product__description: string | null;
  product_overview: string | null;
  product_image: string;
  product_price: string;
  product_discount: string | null;
  product_instock: boolean;
  product_store: any; // Can be ID or Store object

  // M2M junction fields (can be IDs or relational objects after deep fetch)
  // FIX: Allow M2M relationship fields to be `null` to match data from the SDK.
  // This resolves the strict type-checking error during the build process.
  product_category: { category_id: Category }[] | null;
  product_materials: { material_id: Material }[] | null;
  product_colors: number[] | { colors_id: Color }[] | null;
  product_sizes: number[] | { sizes_id: Size }[] | null;
  product_styles: { styles_id: Style }[] | null;
  product_seasons: { seasons_id: Season }[] | null;
  product_genders: { gender_id: Gender }[] | null;
}

export interface DirectusStore {
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
  
  store_vendor?: Vendor | null; // Relation to Vendors
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