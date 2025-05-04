'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  userId: string;
  categories: Category[];
  productLimits: {
    productLimit: number;
    usedProducts: number;
    availableProducts: number;
    maxAnnonceWeeks: number;
  };
}

export default function ProductForm({ userId, categories, productLimits }: ProductFormProps) {
  const router = useRouter();
  const { supabase } = useSupabase();
  
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
  
  // Håndter tekstfelter
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Ryd eventuelle valideringsfejl
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Håndter billede upload
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Begræns til 5 billeder
    if (images.length + newFiles.length > 5) {
      setError('Du kan maksimalt uploade 5 billeder');
      return;
    }
    
    // Opret URL'er til preview
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...newFiles]);
    setImageUrls(prev => [...prev, ...newUrls]);
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // Frigør URL objektet
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  // Validering
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Tjek om der er ledige produktpladser
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
  
  const getRequiredCredits = () => {
    return 1;
  };
  
  // Håndter indsendelse
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const requiredCredits = getRequiredCredits();
    if (productLimits.availableProducts < requiredCredits) {
      setError(`Du har ikke nok ledige produktpladser. Denne annonce kræver ${requiredCredits} pladser, og du har ${productLimits.availableProducts} ledige pladser.`);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const tagArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '')
        .slice(0, 5); // Max 5 tags
      
      // Beregn udløbsdato (2 uger som standard)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);
      
      // 1. Upload billeder til storage
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
        
        // Få offentlig URL til billedet
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        uploadedImageUrls.push(publicUrl);
      }
      
      // 2. Opret produkt i databasen
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
      
      // 3. Træk ledige pladser fra brugerens konto
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ 
          availableProducts: productLimits.availableProducts - requiredCredits,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (creditError) {
        throw new Error(`Kunne ikke trække ledige pladser: ${creditError.message}`);
      }
      
      // Omdirigér til dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Fejl ved oprettelse af produkt:', err);
      setError(err.message || 'Der opstod en fejl ved oprettelse af produktet');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
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
                <strong>Produkter:</strong> {productLimits.usedProducts} ud af {productLimits.productLimit} brugt
                {productLimits.availableProducts > 0 ? (
                  <span className="text-green-600 ml-2">
                    ({productLimits.availableProducts} ledige)
                  </span>
                ) : (
                  <span className="text-red-600 ml-2">
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
                <strong>Maksimal annoncetid:</strong> {productLimits.maxAnnonceWeeks} uger
              </span>
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
      </div>
      
      <div className="mb-6">
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
      
      <div className="mb-6">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
      </div>
      
      <div className="mb-6">
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
      
      <div className="mb-8">
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
        
        <p className="text-xs text-gray-500">
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
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSubmitting ? 'Opretter produkt...' : 'Opret produkt'}
        </button>
      </div>
    </form>
  );
} 