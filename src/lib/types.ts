export interface Profile {
  id: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  postalCode?: string;
  postal_code?: string;
  phone?: string;
  banned_until?: Date;
  credits: number;
  createdAt?: Date;
  updatedAt?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  discount_price?: number;
  discountActive?: boolean;
  discount_active?: boolean;
  images: (string | { url: string })[];
  image_url?: string | null;
  tags: string[];
  category: string;
  subcategory?: string;
  location?: string;
  condition?: string;
  brand?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  color?: string;
  createdAt?: Date;
  expiresAt?: Date;
  created_at?: Date;
  expires_at?: Date;
  userId?: string;
  user_id?: string;
  user?: Profile;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  subcategories?: Category[];
}

export interface Transaction {
  id: string;
  seller_id: string;
  buyer_id: string;
  product_id: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id: string;
  content: string;
  read: boolean;
  created_at: Date;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  active: boolean;
}

export type SubscriptionPackage = {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  product_limit: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductSlot = {
  id: string;
  name: string;
  description: string | null;
  slot_count: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}; 