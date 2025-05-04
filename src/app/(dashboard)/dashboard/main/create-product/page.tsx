'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [userId, setUserId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [productLimits, setProductLimits] = useState({
    productLimit: 0,
    usedProducts: 0,
    availableProducts: 0,
    maxAnnonceWeeks: 2
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    tags: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Hent brugerens profil og abonnement
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileData && subscriptionData) {
          setProductLimits({
            productLimit: subscriptionData.total_slots || 0,
            usedProducts: subscriptionData.used_slots || 0,
            availableProducts: subscriptionData.available_slots || 0,
            maxAnnonceWeeks: subscriptionData.max_weeks || 2
          });
        }

        // Hent kategorier
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesData) {
          setCategories(categoriesData);
        }
      }
    };

    fetchData();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    if (images.length + newFiles.length > 5) {
      setError('Du kan maksimalt uploade 5 billeder');
      return;
    }
    
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...newFiles]);
    setImageUrls(prev => [...prev, ...newUrls]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (productLimits.availableProducts <= 0) {
      errors.general = 'Du har ikke flere ledige produktpladser. Køb flere pladser eller opgrader din pakke.';
      setValidationErrors(errors);
      return false;
    }

    if (!formData.title) {
      errors.title = 'Titel er påkrævet';
    } else if (formData.title.length > 60) {
      errors.title = 'Titel må højst være 60 tegn';
    }
    
    if (!formData.description) {
      errors.description = 'Beskrivelse er påkrævet';
    } else if (formData.description.length < 50) {
      errors.description = 'Beskrivelse skal være mindst 50 tegn';
    }
    
    if (!formData.price) {
      errors.price = 'Pris er påkrævet';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = 'Indtast venligst en gyldig pris';
    }
    
    if (!formData.category) {
      errors.category = 'Kategori er påkrævet';
    }
    
    if (images.length === 0) {
      errors.images = 'Du skal uploade mindst ét billede';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const tagArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '')
        .slice(0, 5);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);
      
      const uploadedImageUrls = [];
      
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `products/${userId}/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);
        
        if (uploadError) {
          throw new Error(`Billedupload fejlede: ${uploadError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        uploadedImageUrls.push(publicUrl);
      }
      
      const { error: productError, data: productData } = await supabase
        .from('products')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          discount_price: null,
          discount_active: false,
          images: uploadedImageUrls,
          tags: tagArray,
          category: formData.category,
          expires_at: expiresAt.toISOString(),
          user_id: userId
        })
        .select()
        .single();
      
      if (productError) {
        throw new Error(`Produktoprettelse fejlede: ${productError.message}`);
      }
      
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ 
          availableProducts: productLimits.availableProducts - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (creditError) {
        throw new Error(`Kunne ikke trække ledige pladser: ${creditError.message}`);
      }
      
      router.push('/dashboard/main/products');
      
    } catch (err: any) {
      console.error('Fejl ved oprettelse af produkt:', err);
      setError(err.message || 'Der opstod en fejl ved oprettelse af produktet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Opret nyt produkt</h1>
          <div className="flex gap-4">
            <Link
              href="/packages"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1AA49A] hover:bg-[#158F86] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1AA49A]"
            >
              Køb pakke
            </Link>
            <Link
              href="/product-slots"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#BC1964] hover:bg-[#A01453] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BC1964]"
            >
              Køb mere plads
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/dashboard/main"
            className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]"
          >
            Oversigt
          </Link>
          <Link
            href="/dashboard/main/products"
            className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]"
          >
            Mine produkter
          </Link>
          <Link
            href="/dashboard/main/create-product"
            className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm border-[#BC1964] text-[#BC1964]"
          >
            Opret produkt
          </Link>
          <Link
            href="/dashboard/main/messages"
            className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]"
          >
            Beskeder
          </Link>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mb-8">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-100 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-yellow-800 mb-3">
              Din abonnementsstatus
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-yellow-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>
                  <strong className="text-[#BC1964]">Produkter:</strong> {productLimits.usedProducts} ud af <span className="text-[#BC1964]">{productLimits.productLimit}</span> brugt
                  {productLimits.availableProducts > 0 ? (
                    <span className="text-[#1AA49A] ml-2">
                      ({productLimits.availableProducts} ledige)
                    </span>
                  ) : (
                    <span className="text-[#BC1964] ml-2">
                      (Ingen ledige pladser)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center text-yellow-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>
                  <strong className="text-[#BC1964]">Maksimal annoncetid:</strong> <span className="text-[#1AA49A]">{productLimits.maxAnnonceWeeks}</span> uger
                </span>
              </div>
            </div>
            <div className="mt-4 text-sm text-yellow-600">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Brug dine produktpladser klogt - jo længere annoncetid, jo bedre chance for salg!
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titel <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={60}
              className={`block w-full rounded-md ${
                validationErrors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } shadow-sm sm:text-sm`}
            />
            {formData.title && (
              <p className="mt-1 text-xs text-gray-500">{formData.title.length}/60 tegn</p>
            )}
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Beskrivelse <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={`block w-full rounded-md ${
                validationErrors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } shadow-sm sm:text-sm`}
            />
            {formData.description && (
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length} tegn (minimum 50 tegn)
              </p>
            )}
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Pris (DKK) <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="1"
                className={`block w-full rounded-md ${
                  validationErrors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } shadow-sm pl-9 sm:text-sm`}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">kr.</span>
              </div>
            </div>
            {validationErrors.price && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`block w-full rounded-md ${
                validationErrors.category ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } shadow-sm sm:text-sm`}
            >
              <option value="">Vælg kategori</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {validationErrors.category && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Søgeord/tags (adskil med komma)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="F.eks.: træmøbel, retro, håndlavet"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Tilføj op til 5 tags, som gør det lettere for købere at finde dit produkt
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produktbilleder <span className="text-red-500">*</span> (1-5 billeder)
            </label>
            
            <div className="mt-2 flex flex-wrap gap-4 mb-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`Preview ${index}`} 
                    className="w-24 h-24 object-cover rounded-md border border-gray-300" 
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    &times;
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="mt-1 text-xs text-gray-500">Tilføj</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
            
            {validationErrors.images && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.images}</p>
            )}
            
            <p className="text-sm text-gray-500">
              Upload 1-5 billeder af dit produkt. Første billede vil blive vist som hovedbillede.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md font-medium ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#1AA49A] hover:bg-[#158F86] text-white'
              }`}
            >
              {isSubmitting ? 'Opretter produkt...' : 'Opret produkt'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 