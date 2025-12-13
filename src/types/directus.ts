
import {
  AppConfiguration,
  Post,
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

export interface DirectusFile {
  id: string;
  type: string;
}

export interface DirectusReel {
  id: number;
  status: string;
  date_created: string;
  reel_caption: string | null;
  reel_file: string | DirectusFile; // UUID of the file or Expanded Object
  reel_store: number | DirectusStore; // ID or Expanded Object
  reel_like: number;
  reel_cover: string | null; // Added reel_cover field
}

export interface DirectusProfile {
  id: number;
  status: string;
  user_created: string; // UUID of the user
  date_created: string;
  user_updated?: string;
  date_updated?: string;
  profile_type?: string;
  profile_gender?: string;
  profile_mobile?: string;
  profile_birthday?: string;
  profile_telegram?: string;
  profile_instagram?: string;
  profile_color?: string;
  profile_username?: string;
  profile_stores?: number[];
}

export interface DirectusProduct {
  id: number;
  status: string;
  date_created?: string; // Standard Directus field
  product_name: string;
  product_description: string | null; // Fixed: removed double underscore
  product_overview: string | null;
  product_image: string;
  product_price: string;
  product_discount: string | null;
  product_instock: boolean;
  product_weight: string | number | null; // Added product_weight
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
  
  // Added Reels Relation
  product_reels: { reels_id: DirectusReel | number }[] | null;
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
  
  // Added Reels Relation
  store_reels: number[] | { reels_id: number }[] | null;

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

  // New Fields
  store_cover?: string | null;
  store_color?: string | null;
}

export interface DirectusBlog {
  id: number;
  status: string;
  date_created: string;
  blog_title: string;
  blog_summary: string;
  blog_content: string;
  blog_slug: string;
  blog_image: string;
}

// New Order Interfaces
export interface DirectusOrderItem {
  id: number;
  order: number;
  product: number | DirectusProduct; // Relation to products
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface DirectusOrder {
  id: number;
  status: string;
  user_created: string;
  date_created: string;
  date_updated: string;
  order_total: string;
  store: number | DirectusStore;
  order_trackid: string | null;
  order_weight: string | null;
  items: number[] | DirectusOrderItem[]; // Relation to order_items
}

export interface DirectusSchema {
  configuration: AppConfiguration;
  products: DirectusProduct[];
  stores: DirectusStore[];
  posts: Post[];
  
  // New Collections
  blogs: DirectusBlog[];
  reels: DirectusReel[];
  profiles: DirectusProfile[];
  orders: DirectusOrder[];
  order_items: DirectusOrderItem[];

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
