

// Update the Category interface to match the Directus collection schema
export interface Category {
  id: number;
  category_name: string;
  category_parent: string;
}

// Add new interfaces for Colors and Sizes based on Directus collections
export interface Color {
  id: number;
  color_name: string;
  color_hex: string;
}

export interface Size {
  id: number;
  size_name: string;
}

// Redefined Product interface to match the new relational schema
export interface Product {
  id: string;
  name: string;
  description: string | null;
  overview: string | null;
  image: string;
  
  price: number;
  finalPrice: number; // The actual price after discount is applied
  discountPercentage?: number;
  
  inStock: boolean;
  
  // Relational Store Data
  storeId: string;
  storeName?: string;
  storeSlug?: string;
  storeAvatar?: string;
  
  // M2M Relational Attributes
  category?: Category; // Use the new Category interface
  materials?: Material[];
  colors?: Color[];
  sizes?: Size[];
  styles?: Style[];
  seasons?: Season[];
  genders?: Gender[];
}


export interface Store {
  id: string;
  name: string; // from store_name
  handle: string; // from store_slug
  slug: string; // from store_slug
  title?: string; // from store_title
  avatar: string; // from store_logo
  coverImage: string; // generated placeholder
  followers: number; // mocked
  isFollowing: boolean; // mocked
  description: string; // from store_description
  productIds: number[]; // from store_products

  // Contact & Social Info
  channel?: string; // telegram channel
  instagram?: string;
  website?: string;
  whatsapp?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  telegram?: string; // telegram support
}

export interface Post {
  id: string;
  storeId: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  linkedProductIds?: string[]; // IDs of products tagged in the post
}

export interface CartItem extends Product {
  quantity: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  content: string;
}

export interface AppConfiguration {
  id?: string; // FIX: Make id optional as singletons don't have it
  app_logo?: string; // Added field for the global loader logo
  [key: string]: any;
}

// --- Filter Data Types ---

export interface Season {
  id: number;
  season_name: string;
  season_color: string;
  season_title: string;
}

export interface Style {
  id: number;
  style_name: string;
  style_title: string;
}

export interface Material {
  id: number;
  material_name: string;
  material_title: string;
}

export interface Gender {
  id: number;
  gender_name: string;
  gender_title: string;
  gender_color: string | null;
}

export interface Vendor {
  id: number;
  vendor_title: string;
  vendor_name: string;
  vendor_color: string | null;
  vendor_details: string | null;
  vendor_stores?: number[];
}