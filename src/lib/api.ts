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
import { getSupabaseClient } from './supabase';

// Anvend singleton-instansen af Supabase klienten
const supabase = getSupabaseClient()

// Profil-funktioner
export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Fejl ved hentning af brugerprofil:', error);
    return null;
  }

  return transformUserData(data);
}

export async function updateUserProfile(userId: string, userData: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      first_name: userData.firstName,
      last_name: userData.lastName,
      address: userData.address,
      postal_code: userData.postalCode,
      phone: userData.phone,
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    console.error('Fejl ved opdatering af brugerprofil:', error);
    return null;
  }

  return transformUserData(data);
}

// Produkt-funktioner
export async function getProducts(category?: string, limit = 10): Promise<Product[]> {
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
          postal_code,
          phone,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // Indlæs produktbilleder for hvert produkt
    const productsWithImages = await Promise.all(data.map(async (product) => {
      // Hent billeder fra product_images tabellen for dette produkt
      const { data: imageData, error: imageError } = await supabase
        .from('product_images')
        .select('url, display_order')
        .eq('product_id', product.id)
        .order('display_order', { ascending: true });
        
      if (imageError) {
        console.error(`Fejl ved hentning af billeder for produkt ${product.id}:`, imageError);
      }

      // Sikre at urls er gyldige
      let allImages = [];
      
      // Tjek eksisterende billeder fra product tabellen
      if (product.images && Array.isArray(product.images)) {
        const existingImages = product.images.filter(img => 
          typeof img === 'string' && img.trim() !== '');
        
        if (existingImages.length > 0) {
          allImages = [...existingImages];
        }
      }
      
      // Tilføj billeder fra product_images tabellen
      if (imageData && Array.isArray(imageData)) {
        const imageUrls = imageData
          .filter(img => img && img.url && typeof img.url === 'string' && img.url.trim() !== '')
          .map(img => img.url);
        
        if (imageUrls.length > 0) {
          allImages = [...allImages, ...imageUrls];
        }
      }
      
      // Fjern dubletter
      const uniqueImages = [...new Set(allImages)];
      
      // Opdater produktet med de endelige billeder
      if (uniqueImages.length > 0) {
        product.images = uniqueImages;
      } else if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
        product.images = [];
      }
      
      return product;
    }));
    
    return productsWithImages as Product[];
  } catch (error) {
    console.error('Fejl ved hentning af produkter:', error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    console.log(`Henter produkt med ID: ${id}`);
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          address,
          postal_code,
          phone,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Fejl ved hentning af produkt:', error);
      throw error;
    }
    
    if (!data) {
      console.log(`Intet produkt fundet med ID: ${id}`);
      return null;
    }
    
    console.log("Råt produkt fra databasen:", { 
      id: data.id, 
      title: data.title,
      images: data.images 
    });
    
    // Hent produktbilleder fra product_images tabellen
    const { data: imageData, error: imageError } = await supabase
      .from('product_images')
      .select('url, display_order')
      .eq('product_id', id);
    
    if (imageError) {
      console.error(`Fejl ved hentning af billeder for produkt ${id}:`, imageError);
    }
    
    // Debug billeder
    console.log("Billeddata fra product_images tabellen:", imageData);
    
    // Hent billedliste fra storage bucket som backup
    let storageImages = [];
    try {
      const userId = data.user_id;
      
      // Find alle filer i produkt-mappen
      const { data: storageData, error: storageError } = await supabase.storage
        .from('product-images')
        .list(`${userId}/${id}`);
      
      if (storageError) {
        console.error('Fejl ved hentning af billeder fra storage:', storageError);
      } else if (storageData && Array.isArray(storageData)) {
        console.log('Filer fundet i storage:', storageData);
        
        // Konverter filnavne til offentlige URLs
        storageImages = storageData
          .filter(file => !file.id.endsWith('/'))
          .map(file => {
            const url = supabase.storage
              .from('product-images')
              .getPublicUrl(`${userId}/${id}/${file.name}`).data.publicUrl;
            
            return url;
          });
        
        console.log('Storage billeder URLs:', storageImages);
      }
    } catch (storageErr) {
      console.error('Fejl ved hentning af billeder fra storage:', storageErr);
    }
    
    // Sikre at urls er gyldige
    let imageUrls = [];
    if (imageData && Array.isArray(imageData)) {
      imageUrls = imageData
        .filter(img => img && img.url && typeof img.url === 'string' && img.url.trim() !== '')
        .map(img => img.url);
      
      console.log(`Fandt ${imageUrls.length} gyldige billede-URLs i product_images tabellen:`, imageUrls);
      console.log(`Debug product_images URLs:`, imageUrls);
    } else {
      console.log("Ingen billeder fundet i product_images tabellen eller data er ikke et array");
    }
    
    // Kombinér eksisterende billeder (hvis der er nogen) og nye billeder
    let allImages = [];
    
    // Tjek om data.images indeholder gyldige billeder (fra products tabellen)
    if (data.images && Array.isArray(data.images)) {
      const existingImages = data.images.filter(img => 
        typeof img === 'string' && img.trim() !== '');
      
      console.log(`Fandt ${existingImages.length} gyldige billeder i products.images:`, existingImages);
      
      // Kun tilføj eksisterende billeder hvis der er nogen
      if (existingImages.length > 0) {
        allImages = [...existingImages];
      }
    } else {
      console.log("products.images er null, undefined eller ikke et array");
    }
    
    // Tilføj billeder fra product_images tabellen
    if (imageUrls.length > 0) {
      allImages = [...allImages, ...imageUrls];
    }
    
    // Tilføj billeder fra storage som backup hvis vi ikke har nok billeder
    if (storageImages.length > 0 && allImages.length < storageImages.length) {
      allImages = [...new Set([...allImages, ...storageImages])];
    }
    
    // Fjern dubletter
    const uniqueImages = [...new Set(allImages)];
    console.log(`Kombinerede ${uniqueImages.length} unikke billeder til produktet:`, uniqueImages);
    
    // Hvis der stadig ikke er billeder, sæt images til et tomt array
    if (uniqueImages.length === 0) {
      console.log("Ingen billeder fundet til produktet, returner et tomt array");
      data.images = [];
    } else {
      // Opdater produktet med de endelige billeder
      data.images = uniqueImages;
    }
    
    return transformProductData(data);
  } catch (error) {
    console.error('Fejl ved hentning af produkt:', error);
    return null;
  }
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'userId'> & { userId: string }): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      title: productData.title,
      description: productData.description,
      price: productData.price,
      discount_price: productData.discountPrice,
      discount_active: productData.discountActive,
      images: productData.images,
      tags: productData.tags,
      category: productData.category,
      expires_at: productData.expiresAt,
      user_id: productData.userId,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Fejl ved oprettelse af produkt:', error);
    return null;
  }

  return transformProductData(data);
}

export async function updateProduct(productId: string, productData: Partial<Product>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update({
      title: productData.title,
      description: productData.description,
      price: productData.price,
      discount_price: productData.discountPrice,
      discount_active: productData.discountActive,
      images: productData.images,
      tags: productData.tags,
      category: productData.category,
      expires_at: productData.expiresAt,
    })
    .eq('id', productId)
    .select('*')
    .single();

  if (error) {
    console.error('Fejl ved opdatering af produkt:', error);
    return null;
  }

  return transformProductData(data);
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

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
export async function getMessages(userId: string, productId?: string): Promise<Message[]> {
  let query = supabase
    .from('messages')
    .select('*, sender:sender_id(first_name, last_name), receiver:receiver_id(first_name, last_name)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Fejl ved hentning af beskeder:', error);
    return [];
  }

  return data.map(transformMessageData);
}

export async function sendMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'read'>): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: messageData.senderId,
      receiver_id: messageData.receiverId,
      product_id: messageData.productId,
      content: messageData.content,
      read: false,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Fejl ved afsendelse af besked:', error);
    return null;
  }

  return transformMessageData(data);
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
function transformUserData(data: any): User {
  return {
    id: data.id,
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    email: data.email || '',
    address: data.address || '',
    postalCode: data.postal_code || '',
    phone: data.phone || '',
    bannedUntil: data.banned_until ? new Date(data.banned_until) : null,
    credits: data.credits,
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
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
    userId: data.user_id || '',
    createdAt: data.created_at || new Date().toISOString(),
    status: data.status || 'active',
    user: data.user ? transformUserData(data.user) : null,
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
    senderId: data.sender_id || '',
    receiverId: data.receiver_id || '',
    productId: data.product_id || '',
    content: data.content || '',
    createdAt: data.created_at || new Date().toISOString(),
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
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id as string,
      firstName: data.first_name as string | undefined,
      lastName: data.last_name as string | undefined,
      address: data.address as string | undefined,
      postalCode: data.postal_code as string | undefined,
      phone: data.phone as string | undefined,
      banned_until: data.banned_until ? new Date(data.banned_until as string) : undefined,
      credits: (data.credits as number) || 0,
      created_at: data.created_at ? new Date(data.created_at as string) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at as string) : undefined
    };
  } catch (error) {
    console.error('Fejl ved hentning af profil:', error);
    return null;
  }
};

export const updateProfile = async (userId: string, data: Partial<Profile>): Promise<Profile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...data,
        banned_until: data.banned_until ? new Date(data.banned_until).toISOString() : null
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!profile) return null;

    return {
      id: profile.id as string,
      firstName: profile.first_name as string | undefined,
      lastName: profile.last_name as string | undefined,
      address: profile.address as string | undefined,
      postalCode: profile.postal_code as string | undefined,
      phone: profile.phone as string | undefined,
      banned_until: profile.banned_until ? new Date(profile.banned_until as string) : undefined,
      credits: (profile.credits as number) || 0,
      created_at: profile.created_at ? new Date(profile.created_at as string) : undefined,
      updated_at: profile.updated_at ? new Date(profile.updated_at as string) : undefined
    };
  } catch (error) {
    console.error('Fejl ved opdatering af profil:', error);
    return null;
  }
};

export async function createProfile(userId: string, profileData: Partial<Profile>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: userId, ...profileData }])
      .select()
      .single()
    
    if (error) throw error
    
    return data as Profile
  } catch (error) {
    console.error('Fejl ved oprettelse af profil:', error)
    return null
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
  const allImages: string[] = [];
  
  // Håndter eksisterende billeder
  if (product.images) {
    product.images.forEach(img => {
      if (typeof img === 'string') {
        allImages.push(img);
      } else if (img && typeof img === 'object' && 'url' in img) {
        allImages.push(img.url);
      }
    });
  }
  
  // Hent billeder fra storage hvis nødvendigt
  if (allImages.length === 0) {
    try {
      const { data: storageData } = await supabase.storage
        .from('product-images')
        .list(`${product.userId}/${product.id}`);
        
      if (storageData) {
        const storageUrls = storageData
          .filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i))
          .map(file => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.userId}/${product.id}/${file.name}`);
          
        allImages.push(...storageUrls);
      }
    } catch (error) {
      console.error('Fejl ved hentning af billeder fra storage:', error);
    }
  }
  
  return allImages;
}

export const createMessage = async (messageData: {
  sender_id: string;
  receiver_id: string;
  product_id: string;
  content: string;
}): Promise<Message> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: messageData.sender_id,
        receiver_id: messageData.receiver_id,
        product_id: messageData.product_id,
        content: messageData.content,
        read: false
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Ingen data returneret ved oprettelse af besked');

    return {
      id: data.id as string,
      sender_id: data.sender_id as string,
      receiver_id: data.receiver_id as string,
      product_id: data.product_id as string,
      content: data.content as string,
      read: data.read as boolean,
      created_at: new Date(data.created_at as string)
    };
  } catch (error) {
    console.error('Fejl ved oprettelse af besked:', error);
    throw error;
  }
};

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