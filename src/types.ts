

export interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number; // Percentage off (e.g., 20)
  image: string; // Directus file UUID or URL
  gallery?: string[]; // Array of URLs
  category: string;
  storeId: string;
  storeName?: string;
  storeSlug?: string;
  storeAvatar?: string;
  vendorType?: 'Retail' | 'Wholesale' | 'Boutique';
  description: string;
  stock: number;
  availability: 'In Stock' | 'Low Stock' | 'Out of Stock';
  
  // Variations
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  
  // Specs
  details?: {
    material?: string;
    texture?: string;
    season?: string;
    style?: string;
    origin?: string;
  };

  // Content
  reels?: { id: string; thumbnail: string; url: string }[];
  
  // Social
  reviews?: {
    id: string;
    user: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
  }[];
  
  // Directus System Fields
  date_created?: string;
  date_updated?: string;
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
  id: string;
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