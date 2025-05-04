'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import DashboardHeader from '../../../components/DashboardHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X, Upload, Loader2 } from 'lucide-react';

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  category_name: string;
  condition: string;
  location: string;
  images: { url: string }[];
  status: string;
  featured: boolean;
  created_at: string;
  user_id: string;
};

type Category = {
  id: string;
  name: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { supabase } = useSupabase();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string }[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Hent produkt og kategorier
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hent produkt
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*, categories(id, name)')
          .eq('id', params.id)
          .single();
          
        if (productError) throw productError;
        
        // Hent produktbilleder
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('url, is_cover')
          .eq('product_id', params.id)
          .order('display_order', { ascending: true });
          
        if (imageError) throw imageError;
        
        // Hent kategorier
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name');
          
        if (categoriesError) throw categoriesError;
        
        // Opdater state
        if (productData) {
          setProduct(productData);
          setTitle(productData.title);
          setDescription(productData.description);
          setPrice(productData.price.toString());
          setCategoryId(productData.category_id);
          setCondition(productData.condition);
          setLocation(productData.location);
          setExistingImages(imageData || []);
        }
        
        setCategories(categoriesData);
        
      } catch (error: any) {
        console.error('Fejl ved hentning af data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, supabase]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Tjek om det totale antal billeder overstiger 8
    if (existingImages.length + images.length + newFiles.length > 8) {
      setError('Du kan maksimalt have 8 billeder per produkt');
      return;
    }
    
    setImages(prev => [...prev, ...newFiles]);
  };
  
  const removeExistingImage = async (index: number) => {
    try {
      const imageToDelete = existingImages[index];
      
      // Slet billedet fra product_images tabellen
      const { error: deleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('url', imageToDelete.url);
        
      if (deleteError) throw deleteError;
      
      // Opdater UI
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      
      // Hvis det var det aktive billede, nulstil index
      if (currentImageIndex === index) {
        setCurrentImageIndex(0);
      } else if (currentImageIndex > index) {
        setCurrentImageIndex(prev => prev - 1);
      }
      
    } catch (error) {
      console.error('Fejl ved sletning af billede:', error);
      setError('Der opstod en fejl ved sletning af billedet. Prøv igen senere.');
    }
  };
  
  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !price || !categoryId || !condition || !location) {
      setError('Udfyld venligst alle påkrævede felter');
      return;
    }
    
    if (description.length < 50) {
      setError('Beskrivelsen skal være mindst 50 tegn lang');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Upload nye billeder
      const uploadedImageUrls = [];
      
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${product?.user_id}/${params.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
          });
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        // Tilføj billede til product_images tabellen
        const { error: imageError } = await supabase
          .from('product_images')
          .insert({
            product_id: params.id,
            url: publicUrl,
            display_order: existingImages.length + uploadedImageUrls.length,
            is_cover: existingImages.length + uploadedImageUrls.length === 0
          });
          
        if (imageError) throw imageError;
        
        uploadedImageUrls.push({ url: publicUrl });
      }
      
      // Opdater produkt
      const { error: updateError } = await supabase
        .from('products')
        .update({
          title,
          description,
          price: parseFloat(price),
          category_id: categoryId,
          condition,
          location
        })
        .eq('id', params.id);
        
      if (updateError) throw updateError;
      
      router.push('/dashboard/products');
      
    } catch (err: any) {
      console.error('Fejl ved opdatering af produkt:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        <div className="mt-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        <div className="mt-8 bg-red-50 border border-red-200 p-4">
          <p className="text-red-700">Produktet blev ikke fundet</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      
      <div className="mt-8 bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Rediger produkt</h1>
          <p className="text-gray-600 mt-2">
            Opdater produktets oplysninger og billeder herunder.
          </p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Billeder sektion */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Produktbilleder</h2>
              
              {/* Thumbnail grid */}
              <div className="grid grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={image.url}
                      alt={`Billede ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {images.map((file, index) => (
                  <div key={`new-${index}`} className="relative aspect-square">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Nyt billede ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {existingImages.length + images.length < 8 && (
                  <label className="relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="mt-2 text-sm font-medium text-gray-600">Upload billede</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <p className="text-sm text-gray-500">
                Du kan uploade op til 8 billeder. Det første billede vil blive vist som hovedbillede på produktsiden.
              </p>
            </div>
            
            {/* Produktinformation */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={60}
                  placeholder="F.eks. 'Sony PlayStation 5, 1TB, Hvid, med 2 controllere'"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  En præcis og detaljeret titel øger chancen for at blive fundet
                </p>
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Pris (DKK) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Vælg den kategori, der passer bedst til dit produkt</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                  Stand <span className="text-red-500">*</span>
                </label>
                <select
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Vælg stand</option>
                  <option value="new">Ny (ubrugt med original emballage)</option>
                  <option value="like_new">Som ny (brugt få gange)</option>
                  <option value="very_good">Meget god (let brugt)</option>
                  <option value="good">God (brugt)</option>
                  <option value="acceptable">Acceptabel (slidt)</option>
                  <option value="for_parts">Til reservedele/defekt</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Beskrivelse <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Beskriv dit produkt så detaljeret som muligt og hvorfor du kvitter det"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  Minimum 50 tegn. Du har brugt {description.length} tegn.
                </p>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Lokation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="F.eks. København NV eller 2400"
                  required
                />
              </div>
            </div>
            
            {/* Knapper */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push('/dashboard/products')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Annuller
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 text-sm font-medium text-white rounded-md ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadProgress > 0 ? `Uploader (${uploadProgress}%)` : 'Gemmer...'}
                  </span>
                ) : (
                  'Gem ændringer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 