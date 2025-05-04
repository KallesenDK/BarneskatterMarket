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

  if (!data || typeof data !== 'object') {
    console.error('Fejl ved hentning af brugerprofil: data er ikke et objekt');
    return null;
  }

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
      first_name: userData.first_name,
      last_name: userData.last_name,
      address: userData.address,
      postal_code: userData.postal_code,
      phone: userData.phone,
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (!data || typeof data !== 'object') {
    console.error('Fejl ved opdatering af brugerprofil: data er ikke et objekt');
    return null;
  }

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
    
    if (!data || !Array.isArray(data)) {
      console.error('Fejl ved hentning af produkter: data er ikke et array');
      return [];
    }
    
    if (error) throw error
    
    // Indlæs produktbilleder for hvert produkt
    const productsWithImages = await Promise.all(data.map(async (product) => {
      // Hent billeder fra product_images tabellen for dette produkt
      const { data: imageData, error: imageError } = await supabase
        .from('product_images')
        .select('url, display_order')
        .eq('product_id', String(product.id))
        .order('display_order', { ascending: true });
        
      if (imageError) {
        console.error(`Fejl ved hentning af billeder for produkt ${product.id}:`, imageError);
      }

      // Sikre at urls er gyldige
      let allImages: string[] = [];
      
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
        const imageUrls: string[] = (imageData as { url: string }[])
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
    
    return productsWithImages.map(p => transformProductData(p));
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
    
    if (!data || typeof data !== 'object') {
      console.error('Fejl ved hentning af produkt: data er ikke et objekt');
      return null;
    }
    
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
    let storageImages: string[] = [];
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
    let imageUrls: string[] = [];
    if (imageData && Array.isArray(imageData)) {
      imageUrls = (imageData as any[])
        .filter(img => img && img.url && typeof img.url === 'string' && img.url.trim() !== '')
        .map(img => img.url);
      
      console.log(`Fandt ${imageUrls.length} gyldige billede-URLs i product_images tabellen:`, imageUrls);
      console.log(`Debug product_images URLs:`, imageUrls);
    } else {
      console.log("Ingen billeder fundet i product_images tabellen eller data er ikke et array");
    }
    
    // Kombinér eksisterende billeder (hvis der er nogen) og nye billeder
    let allImages: string[] = [];
    
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

  if (!data || typeof data !== 'object') {
    console.error('Fejl ved oprettelse af produkt: data er ikke et objekt');
    return null;
  }

  if (error) {
    console.error('Fejl ved oprettelse af produkt:', error);
    return null;
  }

  return transformProductData(data);
}

export async function updateProduct(product_id: string, productData: Partial<Product>): Promise<Product | null> {
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
    .eq('id', product_id)
    .select('*')
    .single();

  if (!data || typeof data !== 'object') {
    console.error('Fejl ved opdatering af produkt: data er ikke et objekt');
    return null;
  }

  if (error) {
    console.error('Fejl ved opdatering af produkt:', error);
    return null;
  }

  return transformProductData(data);
}

export async function deleteProduct(product_id: string): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', product_id);

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

  if (!data || !Array.isArray(data)) {
    console.error('Fejl ved hentning af kategorier: data er ikke et array');
    return [];
  }

  if (error) {
    console.error('Fejl ved hentning af kategorier:', error);
    return [];
  }

  return data.map(transformCategoryData);
}

// Besked-funktioner
export async function getMessages(userId: string, product_id?: string): Promise<Message[]> {
  let query = supabase
    .from('messages')
    .select('*, sender:sender_id(first_name, last_name), receiver:receiver_id(first_name, last_name)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (product_id) {
    query = query.eq('product_id', product_id);
  }

  const { data, error } = await query;

  if (!data || !Array.isArray(data)) {
    console.error('Fejl ved hentning af beskeder: data er ikke et array');
    return [];
  }

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
      sender_id: messageData.sender_id,
      receiver_id: messageData.receiver_id,
      product_id: messageData.product_id,
      content: messageData.content,
      read: false,
    })
    .select('*')
    .single();

  if (!data || typeof data !== 'object') {
    console.error('Fejl ved afsendelse af besked: data er ikke et objekt');
    return null;
  }

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

  if (!data || !Array.isArray(data)) {
    console.error('Fejl ved hentning af kredit pakker: data er ikke et array');
    return [];
  }

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
    first_name: data.first_name,
    last_name: data.last_name,
    address: data.address,
    postal_code: data.postal_code,
    phone: data.phone,
    banned_until: data.banned_until ? new Date(data.banned_until) : undefined,
    credits: data.credits,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

function transformProductData(data: any): Product {
  const product: Product = {
    id: data.id,
    title: data.title,
    description: data.description,
    price: data.price,
    discountPrice: data.discount_price,
    discountActive: data.discount_active,
    images: data.images as string[],
    tags: data.tags || [],
    category: data.category,
    location: data.location || null,
    createdAt: new Date(data.created_at),
    expiresAt: new Date(data.expires_at),
    userId: data.user_id,
  };

  if (data.user) {
    product.user = {
      id: data.user.id,
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      address: data.user.address || null,
      postal_code: data.user.postal_code || null,
      phone: data.user.phone || null,
      credits: 0,
      created_at: new Date(data.user.created_at),
      updated_at: new Date(data.user.updated_at),
    };
  }

  return product;
}

function transformCategoryData(data: any): Category {
  return {
    id: data.id,
    name: data.name,
    parentId: data.parent_id,
  };
}

function transformMessageData(data: any): Message {
  const message: Message = {
    id: data.id,
    sender_id: data.sender_id,
    receiver_id: data.receiver_id,
    product_id: data.product_id,
    content: data.content,
    read: data.read,
    created_at: new Date(data.created_at),
  };

  return message;
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
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (!data || typeof data !== 'object') {
      console.error('Fejl ved hentning af profil: data er ikke et objekt');
      return null;
    }
    
    if (error) throw error
    
    if (data && 'id' in data && 'credits' in data) {
      return { ...data, credits: (data as any).credits ?? 0 } as Profile
    } else {
      return null
    }
  } catch (error) {
    console.error('Fejl ved hentning af profil:', error)
    return null
  }
}

export async function updateProfile(userId: string, profileData: Partial<Profile>): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single()
    
    if (!data || typeof data !== 'object') {
      console.error('Fejl ved opdatering af profil: data er ikke et objekt');
      return null;
    }
    
    if (error) throw error
    
    if (data && 'id' in data && 'credits' in data) {
      return { ...data, credits: (data as any).credits ?? 0 } as Profile
    } else {
      return null
    }
  } catch (error) {
    console.error('Fejl ved opdatering af profil:', error)
    return null
  }
}

export async function createProfile(userId: string, profileData: Partial<Profile>): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: userId, ...profileData }])
      .select()
      .single()
    
    if (!data || typeof data !== 'object') {
      console.error('Fejl ved oprettelse af profil: data er ikke et objekt');
      return null;
    }
    
    if (error) throw error
    
    if (data && 'id' in data && 'credits' in data) {
      return { ...data, credits: (data as any).credits ?? 0 } as Profile
    } else {
      return null
    }
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

  if (!data || !Array.isArray(data)) {
    console.error('Fejl ved hentning af abonnement pakker: data er ikke et array');
    return [];
  }

  if (error) throw error;
  return data;
}

export async function getAllSubscriptionPackages() {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*')
    .order('price', { ascending: true });

  if (!data || !Array.isArray(data)) {
    console.error('Fejl ved hentning af alle abonnement pakker: data er ikke et array');
    return [];
  }

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

  if (!data || typeof data !== 'object') {
    console.error('Fejl ved opdatering af abonnement pakke: data er ikke et objekt');
    return null;
  }

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

  if (!data || !Array.isArray(data)) {
    console.error('Fejl ved hentning af produkt slots: data er ikke et array');
    return [];
  }

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

  // Type guard for pkg
  if (!pkg || typeof pkg.duration_weeks !== 'number') {
    throw new Error('Ugyldig eller manglende duration_weeks på abonnementspakke');
  }

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
      product_limit: Number(currentLimit?.product_limit ?? 0) + Number(slot.slot_count)
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
      .eq('id', String(subscription.plan_id))
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
      availableProducts: Math.max(0, Number(productLimit) - Number(usedProducts))
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