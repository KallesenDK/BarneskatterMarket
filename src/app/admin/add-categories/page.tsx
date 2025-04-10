'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';

type Category = {
  id: string;
  name: string;
  created_at?: string;
};

export default function AddCategoriesPage() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Hent kategorier når siden indlæses
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Fejl ved hentning af kategorier:', error);
        throw error;
      }

      setCategories(data || []);
    } catch (error: any) {
      console.error('Fejl ved hentning af kategorier:', error);
      setResult({
        success: false,
        message: `Kunne ikke hente kategorier: ${error?.message || 'Ukendt fejl'}`
      });
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setResult({
        success: false,
        message: 'Kategorifeltet må ikke være tomt'
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setDebugInfo(null);
    
    try {
      // Lad Supabase generere ID'et automatisk
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newCategoryName,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Supabase fejl detaljer:', error);
        setDebugInfo(JSON.stringify(error, null, 2));
        throw error;
      }

      setResult({
        success: true,
        message: `Kategorien "${newCategoryName}" blev tilføjet!`
      });
      
      // Nulstil input feltet
      setNewCategoryName('');
      
      // Opdater kategorilisten
      await fetchCategories();
    } catch (error: any) {
      console.error('Fejl ved oprettelse af kategori:', error);
      setDebugInfo(JSON.stringify(error, null, 2));
      setResult({
        success: false,
        message: `Der opstod en fejl under tilføjelsen af kategorien: ${error?.message || 'Ukendt fejl'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory || !editingCategory.name.trim()) {
      setResult({
        success: false,
        message: 'Kategorifeltet må ikke være tomt'
      });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCategory.id);

      if (error) {
        console.error('Supabase fejl ved opdatering:', error);
        throw error;
      }

      setResult({
        success: true,
        message: `Kategorien "${editingCategory.name}" blev opdateret!`
      });
      
      // Nulstil redigering
      setEditingCategory(null);
      
      // Opdater kategorilisten
      await fetchCategories();
    } catch (error: any) {
      console.error('Fejl ved opdatering af kategori:', error);
      setResult({
        success: false,
        message: `Der opstod en fejl under opdateringen af kategorien: ${error?.message || 'Ukendt fejl'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Er du sikker på, at du vil slette kategorien "${name}"?`)) {
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase fejl ved sletning:', error);
        throw error;
      }

      setResult({
        success: true,
        message: `Kategorien "${name}" blev slettet!`
      });
      
      // Opdater kategorilisten
      await fetchCategories();
    } catch (error: any) {
      console.error('Fejl ved sletning af kategori:', error);
      setResult({
        success: false,
        message: `Der opstod en fejl under sletningen af kategorien: ${error?.message || 'Ukendt fejl'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Administrer Kategorier</h1>
        
        {result && (
          <div
            className={`p-4 mb-6 ${
              result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {result.message}
          </div>
        )}
        
        <div className="bg-white shadow-sm p-6 mb-6">
          <h2 className="text-xl font-medium mb-4">Tilføj ny kategori</h2>
          
          <form onSubmit={addCategory} className="flex space-x-4">
            <div className="flex-grow">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="block w-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-base rounded-md"
                placeholder="Indtast kategorinavn"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1AA49A] hover:bg-[#1AA49A]/90 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Tilføjer...' : 'Tilføj Kategori'}
            </button>
          </form>
        </div>
        
        {editingCategory && (
          <div className="bg-white shadow-sm p-6 mb-6">
            <h2 className="text-xl font-medium mb-4">Rediger kategori</h2>
            
            <form onSubmit={updateCategory} className="flex space-x-4">
              <div className="flex-grow">
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="block w-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-base rounded-md"
                  placeholder="Rediger kategorinavn"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Opdater
              </button>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
              >
                Annuller
              </button>
            </form>
          </div>
        )}
        
        <div className="bg-white shadow-sm p-6">
          <h2 className="text-xl font-medium mb-4">Eksisterende kategorier</h2>
          
          {categories.length === 0 ? (
            <p className="text-gray-500 italic">Ingen kategorier fundet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navn</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Handlinger</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingCategory(category)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Rediger
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id, category.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Slet
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700 mt-6">
          <h2 className="font-medium mb-2">Bemærk:</h2>
          <p>
            Denne side er til administrativ brug. Her kan du tilføje, redigere og slette kategorier. 
            Vær opmærksom på, at hvis du sletter en kategori, kan det påvirke eksisterende produkter.
          </p>
        </div>
        
        {debugInfo && (
          <div className="mt-6 bg-gray-100 p-4 rounded-md">
            <h3 className="font-medium mb-2 text-gray-700">Debug information:</h3>
            <pre className="text-xs overflow-auto bg-gray-800 text-white p-4 rounded">
              {debugInfo}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 