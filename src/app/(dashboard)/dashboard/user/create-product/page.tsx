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
        });

      if (productError) {
        throw new Error(`Produkt oprettelse fejlede: ${productError.message}`);
      }

      // Opdater brugerens produktpladser
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          used_slots: productLimits.usedProducts + 1,
          available_slots: productLimits.availableProducts - 1
        })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(`Opdatering af produktpladser fejlede: ${updateError.message}`);
      }

      router.push('/dashboard/user/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Opret nyt produkt</h1>
        <p className="mt-1 text-sm text-gray-500">
          Du har {productLimits.availableProducts} ledige produktpladser
        </p>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {validationErrors.general && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{validationErrors.general}</p>
          <div className="mt-4 flex space-x-4">
            <Link
              href="/packages"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1AA49A] hover:bg-[#158F86]"
            >
              Opgrader pakke
            </Link>
            <Link
              href="/product-slots"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#BC1964] hover:bg-[#A01453]"
            >
              Køb flere pladser
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Titel */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titel
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className={`shadow-sm focus:ring-[#1AA49A] focus:border-[#1AA49A] block w-full sm:text-sm border-gray-300 rounded-md ${
                validationErrors.title ? 'border-red-300' : ''
              }`}
              placeholder="F.eks. 'Flot bamse i god stand'"
            />
          </div>
          {validationErrors.title && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.title}</p>
          )}
        </div>

        {/* Beskrivelse */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Beskrivelse
          </label>
          <div className="mt-1">
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`shadow-sm focus:ring-[#1AA49A] focus:border-[#1AA49A] block w-full sm:text-sm border-gray-300 rounded-md ${
                validationErrors.description ? 'border-red-300' : ''
              }`}
              placeholder="Beskriv dit produkt detaljeret..."
            />
          </div>
          {validationErrors.description && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>
          )}
        </div>

        {/* Pris */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Pris (DKK)
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="price"
              id="price"
              value={formData.price}
              onChange={handleChange}
              className={`shadow-sm focus:ring-[#1AA49A] focus:border-[#1AA49A] block w-full sm:text-sm border-gray-300 rounded-md ${
                validationErrors.price ? 'border-red-300' : ''
              }`}
              placeholder="0"
              min="0"
              step="1"
            />
          </div>
          {validationErrors.price && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.price}</p>
          )}
        </div>

        {/* Kategori */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Kategori
          </label>
          <div className="mt-1">
            <select
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              className={`shadow-sm focus:ring-[#1AA49A] focus:border-[#1AA49A] block w-full sm:text-sm border-gray-300 rounded-md ${
                validationErrors.category ? 'border-red-300' : ''
              }`}
            >
              <option value="">Vælg kategori</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {validationErrors.category && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.category}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags (adskil med komma)
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="tags"
              id="tags"
              value={formData.tags}
              onChange={handleChange}
              className="shadow-sm focus:ring-[#1AA49A] focus:border-[#1AA49A] block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="F.eks. 'bamse, legetøj, brugt'"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Du kan tilføje op til 5 tags for at gøre dit produkt mere synligt
          </p>
        </div>

        {/* Billeder */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Produktbilleder
          </label>
          <div className="mt-1">
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="images"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-[#1AA49A] hover:text-[#158F86] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#1AA49A]"
                  >
                    <span>Upload billeder</span>
                    <input
                      id="images"
                      name="images"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">eller træk og slip</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF op til 10MB
                </p>
              </div>
            </div>
          </div>
          {validationErrors.images && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.images}</p>
          )}

          {/* Forhåndsvisning af billeder */}
          {imageUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Billede ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit knap */}
        <div className="pt-5">
          <div className="flex justify-end">
            <Link
              href="/dashboard/user"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1AA49A]"
            >
              Annuller
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#1AA49A] hover:bg-[#158F86] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1AA49A] ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Opretter...' : 'Opret produkt'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 