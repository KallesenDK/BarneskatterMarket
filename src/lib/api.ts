import { 
  User, 
  Product, 
  Category, 
  Transaction, 
  Message, 
  CreditPackage,
  Profile,
  SubscriptionPackage,
  ProductSlot
} from './types';
import { createClient } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Profil-funktioner
export async function getUserProfile(userId: string): Promise<Profile | undefined> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return undefined;

    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      banned_until: data.banned_until ? new Date(data.banned_until) : null,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return undefined;
  }
}

export async function updateUserProfile(userId: string, profile: Partial<Profile>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        address: profile.address,
        postal_code: profile.postal_code,
        phone: profile.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');

    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      banned_until: data.banned_until ? new Date(data.banned_until) : null,
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Produkt-funktioner
export async function getProducts(category?: string, limit = 10): Promise<Product[]> {
  if (!supabase) {
    throw new Error('Supabase klient er ikke initialiseret');
  }

  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          address,
          postal_code
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (category && category !== 'Alle') {
      query = query.eq('category', category);
    }

    if (limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data) return [];

    return data.map(product => ({
      ...product,
      user: product.user ? {
        id: product.user.id,
        first_name: product.user.first_name,
        last_name: product.user.last_name,
        address: product.user.address,
        postal_code: product.user.postal_code
      } : null
    }));
  } catch (error) {
    console.error('Fejl ved hentning af produkter:', error);
    return [];
  }
}

export const getProductById = getProduct;

export async function getProduct(id: string): Promise<Product | null> {
  const { data: product, error } = await supabase
    .from('products')
    .select('*, category:categories(*), owner:profiles(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return product;
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'userId'> & { userId: string }): Promise<Product | null> {
  if (!supabase) {
    throw new Error('Supabase klient er ikke initialiseret');
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      title: productData.title,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      user_id: productData.userId,
      status: 'active',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Fejl ved oprettelse af produkt:', error);
    return null;
  }

  return data || null;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return null;
  }

  return data;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase klient er ikke initialiseret');
  }

  const { error } = await supabase
    .from('products')
    .update({ status: 'deleted' })
    .eq('id', id);

  if (error) {
    console.error('Fejl ved sletning af produkt:', error);
    return false;
  }

  return true;
}

// Kategori-funktioner
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Fejl ved hentning af kategorier:', error);
    return [];
  }

  return data.map(transformCategoryData);
}

// Besked-funktioner
export async function getMessages(userId: string): Promise<Message[]> {
  if (!supabase) {
    throw new Error('Supabase klient er ikke initialiseret');
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fejl ved hentning af beskeder:', error);
    return [];
  }

  return data || [];
}

export async function createMessage(message: {
  sender_id: string;
  receiver_id: string;
  content: string;
}): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: message.sender_id,
          receiver_id: message.receiver_id,
          content: message.content,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error creating message:', error);
    return null;
  }
}

export async function markMessageAsRead(messageId: string): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase klient er ikke initialiseret');
  }

  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);

  if (error) {
    console.error('Fejl ved markering af besked som læst:', error);
    return false;
  }

  return true;
}

// Kredit pakke funktioner
export async function getCreditPackages(): Promise<CreditPackage[]> {
  const { data, error } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('active', true)
    .order('credits');

  if (error) {
    console.error('Fejl ved hentning af kredit pakker:', error);
    return [];
  }

  return data.map(transformCreditPackageData);
}

// Hjælpefunktioner til transformation af data
function transformUserData(data: Profile): Profile {
  return {
    id: data.id,
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    address: data.address || '',
    postal_code: data.postal_code || '',
    phone: data.phone || '',
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    banned_until: data.banned_until ? new Date(data.banned_until) : undefined,
    credits: data.credits || 0,
    is_admin: data.is_admin || false
  };
}

function transformProductData(data: any): Product {
  const images = data.images || [];
  const transformedImages = images.map((img: string | { url: string }) => {
    return typeof img === 'string' ? img : img.url;
  });

  return {
    id: data.id,
    title: data.title || '',
    description: data.description || '',
    price: data.price || 0,
    category: data.category || '',
    condition: data.condition || '',
    images: transformedImages,
    tags: data.tags || [],
    user_id: data.user_id || '',
    created_at: data.created_at ? new Date(data.created_at) : undefined,
    expires_at: data.expires_at ? new Date(data.expires_at) : undefined,
    user: data.user ? transformUserData(data.user) : undefined,
  };
}

function transformCategoryData(data: any): Category {
  return {
    id: data.id,
    name: data.name,
    parentId: data.parent_id,
  };
}

function transformMessageData(data: any): Message {
  return {
    id: data.id,
    sender_id: data.sender_id || '',
    receiver_id: data.receiver_id || '',
    product_id: data.product_id || '',
    content: data.content || '',
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    read: data.read || false,
  };
}

function transformCreditPackageData(data: any): CreditPackage {
  return {
    id: data.id,
    name: data.name,
    credits: data.credits,
    price: data.price,
    active: data.active,
  };
}

// Profil API
export const getProfile = async (userId: string): Promise<Profile | undefined> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return undefined;

    return {
      id: data.id,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      address: data.address || '',
      postal_code: data.postal_code || '',
      phone: data.phone || '',
      banned_until: data.banned_until ? new Date(data.banned_until) : undefined,
      credits: data.credits || 0,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      is_admin: data.is_admin || false
    };
  } catch (error) {
    console.error('Fejl ved hentning af profil:', error);
    return undefined;
  }
};

export async function updateProfile(
  supabase: SupabaseClient,
  profile: Partial<Profile>
): Promise<{ data: Profile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        address: profile.address,
        postal_code: profile.postal_code,
        phone: profile.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');

    const profile_data: Profile = {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      banned_until: data.banned_until ? new Date(data.banned_until) : undefined,
      credits: data.credits || 0,
      is_admin: data.is_admin || false
    };

    return { data: profile_data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error: error as Error };
  }
}

export async function createProfile(userId: string, profileData: Partial<Profile>): Promise<Profile | undefined> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ 
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return undefined;
    
    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      banned_until: data.banned_until ? new Date(data.banned_until) : undefined,
      credits: data.credits || 0,
      is_admin: data.is_admin || false
    };
  } catch (error) {
    console.error('Fejl ved oprettelse af profil:', error);
    return undefined;
  }
}

// Auth API til brug på klientsiden
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Fejl ved hentning af session:', error)
    return null
  }
  return data.session
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Fejl ved hentning af bruger:', error)
    return null
  }
  return data.user
}

// Subscription Packages
export async function getSubscriptionPackages() {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAllSubscriptionPackages() {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*')
    .order('price', { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateSubscriptionPackage(id: string, updates: Partial<SubscriptionPackage>) {
  const { data, error } = await supabase
    .from('subscription_packages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Product Slots
export async function getProductSlots() {
  const { data, error } = await supabase
    .from('product_slots')
    .select('*')
    .eq('is_active', true)
    .order('slot_count', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAllProductSlots() {
  const { data, error } = await supabase
    .from('product_slots')
    .select('*')
    .order('slot_count', { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateProductSlot(id: string, updates: Partial<ProductSlot>) {
  const { data, error } = await supabase
    .from('product_slots')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Purchase functions
export async function purchaseSubscriptionPackage(packageId: string, userId: string) {
  const { data: pkg, error: pkgError } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('id', packageId)
    .single();

  if (pkgError) throw pkgError;

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + (pkg.duration_weeks * 7));

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: packageId,
      status: 'active',
      starts_at: new Date().toISOString(),
      expires_at: expiryDate.toISOString(),
      amount_paid: pkg.price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function purchaseProductSlots(slotId: string, userId: string) {
  const { data: slot, error: slotError } = await supabase
    .from('product_slots')
    .select('*')
    .eq('id', slotId)
    .single();

  if (slotError) throw slotError;

  // Hent brugerens nuværende produktgrænse
  const { data: currentLimit, error: limitError } = await supabase
    .from('profiles')
    .select('product_limit')
    .eq('id', userId)
    .single();

  if (limitError) throw limitError;

  // Opdater brugerens produktgrænse
  const { data, error } = await supabase
    .from('profiles')
    .update({
      product_limit: (currentLimit?.product_limit || 0) + slot.slot_count
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Nye funktioner til at hente brugerens abonnement og produktgrænser
export async function getUserSubscription(userId: string) {
  try {
    // Først, hent subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .single();

    if (subError) {
      console.error('Fejl ved hentning af subscription:', subError);
      return null;
    }

    if (!subscription) {
      console.log('Ingen aktiv subscription fundet for bruger:', userId);
      return null;
    }

    // Derefter, hent subscription package
    const { data: package_data, error: pkgError } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('id', subscription.plan_id)
      .single();

    if (pkgError) {
      console.error('Fejl ved hentning af subscription package:', pkgError);
      return null;
    }

    // Kombiner data
    return {
      ...subscription,
      package: package_data
    };
  } catch (error) {
    console.error('Uventet fejl i getUserSubscription:', error);
    return null;
  }
}

export async function getUserProductLimits(userId: string) {
  try {
    // Hent brugerens aktive subscription og package data
    const subscription = await getUserSubscription(userId);
    
    // Hent antal produkter brugeren har oprettet
    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (productError) {
      console.error('Fejl ved optælling af produkter:', productError);
      return {
        productLimit: 0,
        usedProducts: 0,
        availableProducts: 0
      };
    }

    const productLimit = subscription?.package?.product_limit || 0;
    const usedProducts = productCount || 0;

    return {
      productLimit,
      usedProducts,
      availableProducts: Math.max(0, productLimit - usedProducts)
    };
  } catch (error) {
    console.error('Fejl i getUserProductLimits:', error);
    return {
      productLimit: 0,
      usedProducts: 0,
      availableProducts: 0
    };
  }
}

export async function getProductImages(product: Product): Promise<string[]> {
  if (!product?.id || !supabase) {
    return [];
  }

  try {
    const { data: imageData, error: imageError } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', product.id)
      .order('display_order');

    if (imageError) throw imageError;
    
    return imageData?.map(img => img.url) || [];
  } catch (error) {
    console.error('Fejl ved hentning af produktbilleder:', error);
    return [];
  }
}

export const getMessage = async (messageId: string): Promise<Message | null> => {
  try {
    const { data: message, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, first_name, last_name),
        receiver:receiver_id(id, first_name, last_name)
      `)
      .eq('id', messageId)
      .single();

    if (error) throw error;
    if (!message) return null;

    return {
      ...message,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      sender: message.sender,
      receiver: message.receiver
    } as Message;
  } catch (error) {
    console.error('Fejl ved hentning af besked:', error);
    return null;
  }
}; 