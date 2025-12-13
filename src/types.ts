



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
  color_title?: string;
  color_hex?: string; // Kept for mock compatibility
  color_decimal?: string; // From API
  color_family?: string; // For filtering
}

export interface Size {
  id: number;
  size_name: string;
  size_title?: string; // Added size_title
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
  weight?: string | number; // Added weight
  
  // Relational Store Data
  storeId: string;
  storeName?: string;
  storeSlug?: string;
  storeAvatar?: string;
  storeColor?: string; // Added storeColor for branding
  storeVendor?: Vendor; // Added Vendor info for filtering
  
  // M2M Relational Attributes
  category?: Category; // Use the new Category interface
  materials?: Material[];
  colors?: Color[];
  sizes?: Size[];
  styles?: Style[];
  seasons?: Season[];
  genders?: Gender[];
  
  // Linked Reels (IDs)
  relatedReelIds?: number[];
}


export interface Store {
  id: string;
  name: string; // from store_name
  handle: string; // from store_slug
  slug: string; // from store_slug
  title?: string; // from store_title
  avatar: string; // from store_logo
  coverImage?: string; // generated placeholder or from store_cover
  coverColor?: string; // from store_color
  followers: number; // mocked
  isFollowing: boolean; // mocked
  description: string; // from store_description
  productIds: number[]; // from store_products
  reelIds: number[]; // from store_reels

  // Contact & Social Info
  channel?: string; // telegram channel
  instagram?: string;
  website?: string;
  whatsapp?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  telegram?: string; // telegram support
  
  vendor?: Vendor;
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

// New Reel Interface
export interface Reel {
  id: number;
  caption: string;
  media: string; // URL to the image/video
  mimeType?: string; // Type of the media file (e.g. video/mp4, image/jpeg)
  likes: number;
  date: string;
  cover?: string; // Added cover image property
  store: {
    id: string;
    name: string;
    slug: string;
    avatar: string;
    handle: string;
    coverImage?: string; // Added to match usage in SocialFeed
  };
}

export interface CartItem extends Product {
  quantity: number;
}

// New Order Interfaces
export interface OrderItem {
  id: number;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  status: string;
  date: string;
  total: number;
  trackingCode: string | null;
  storeName: string;
  storeSlug: string;
  storeLogo: string;
  items: OrderItem[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  content: string; // Full content
  slug: string; // Added slug
}

export interface AppConfiguration {
  id?: string; // FIX: Make id optional as singletons don't have it
  app_logo?: string; // Added field for the global loader logo
  app_title?: string; // Added field for the app title
  app_user_role?: string; // The Directus Role ID for new users
  [key: string]: any;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  role?: string;
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
