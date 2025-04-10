'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSupabase } from '@/components/SupabaseProvider';
import DashboardHeader from '../components/DashboardHeader';

export default function CreateProductPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      
      try {
        // Hent nuværende bruger
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/auth/signin');
          return;
        }
        
        setUserId(user.id);
        
        // Hent antal eksisterende produkter for brugeren
        const { count, error } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (error) {
          throw error;
        }
        
        setProductCount(count || 0);
      } catch (error) {
        console.error('Fejl ved hentning af bruger eller produkter:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [supabase, router]);
  
  const handleStartCreation = () => {
    router.push('/dashboard/create-product/new');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      
      <div className="mt-8 bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            {productCount === 0 ? 'Opret dit første produkt' : 'Opret nyt produkt'}
          </h1>
          {productCount === 0 && (
            <p className="text-gray-600 mt-2">
              Kom i gang med at sælge ved at oprette dit første produkt. Følg guiden nedenfor.
            </p>
          )}
        </div>
        
        {productCount === 0 ? (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex mb-8">
                <div className="w-1/3 text-center">
                  <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <p className="mt-2 text-sm font-medium">Før du starter</p>
                </div>
                <div className="w-1/3 text-center">
                  <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <p className="mt-2 text-sm font-medium">Forbered dine billeder</p>
                </div>
                <div className="w-1/3 text-center">
                  <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                    3
                  </div>
                  <p className="mt-2 text-sm font-medium">Opret produkt</p>
                </div>
              </div>
              
              {step === 1 && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Før du starter</h2>
                  <p className="mb-4">For at skabe den bedste annonce, bør du have følgende klar:</p>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span>En præcis <strong>titel</strong> der beskriver dit produkt tydeligt</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span>En detaljeret <strong>beskrivelse</strong> af produktet, dets funktioner og fordele</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span>Hvilket <strong>kategori</strong> dit produkt tilhører</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span>Den <strong>pris</strong> du ønsker at sælge for - Husk at vi fratrækker din provisionssats før vi overfører pengene</span>
                    </li>
                  </ul>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setStep(2)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                    >
                      Fortsæt til billeder
                    </button>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Forbered dine billeder</h2>
                  <p className="mb-4">Gode billeder øger chancen for salg. Her er nogle tips:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h3 className="font-medium text-lg mb-2">Gør dette</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                          </svg>
                          <span>Tag billeder i god belysning</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                          </svg>
                          <span>Vis produktet fra flere vinkler</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                          </svg>
                          <span>Fokuser på detaljer og kvalitet</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h3 className="font-medium text-lg mb-2">Undgå dette</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                          </svg>
                          <span>Slørede eller mørke billeder</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                          </svg>
                          <span>Rod i baggrunden</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                          </svg>
                          <span>For små eller komprimerede billeder</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button 
                      onClick={() => setStep(1)}
                      className="text-blue-600 hover:text-blue-800 px-4 py-2 font-medium"
                    >
                      Tilbage
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                    >
                      Fortsæt til oprettelse
                    </button>
                  </div>
                </div>
              )}
              
              {step === 3 && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Opret dit produkt</h2>
                  <p className="mb-6">Nu er du klar til at oprette dit produkt. Klik på knappen nedenfor for at begynde.</p>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <h3 className="font-medium text-lg mb-4">Sådan fungerer processen:</h3>
                    <ol className="space-y-4 mb-4">
                      <li className="flex">
                        <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center font-medium mr-3">1</span>
                        <div>
                          <p className="font-medium">Udfyld produktoplysninger</p>
                          <p className="text-sm text-gray-600">Titel, kategori, pris og beskrivelse</p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center font-medium mr-3">2</span>
                        <div>
                          <p className="font-medium">Upload billeder</p>
                          <p className="text-sm text-gray-600">Du kan uploade op til 8 billeder</p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center font-medium mr-3">3</span>
                        <div>
                          <p className="font-medium">Gennemgå og publicer</p>
                          <p className="text-sm text-gray-600">Kontroller og godkend din annonce</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="flex justify-between">
                    <button 
                      onClick={() => setStep(2)}
                      className="text-blue-600 hover:text-blue-800 px-4 py-2 font-medium"
                    >
                      Tilbage
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleStartCreation}
                      className="bg-[#1AA49A] hover:bg-[#1AA49A]/90 text-white px-6 py-3 rounded-md font-medium"
                    >
                      Start oprettelse af produkt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Du har allerede oprettet {productCount} {productCount === 1 ? 'produkt' : 'produkter'}. 
              Du kan oprette flere produkter herunder.
            </p>
            
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                onClick={handleStartCreation}
                className="bg-[#1AA49A] hover:bg-[#1AA49A]/90 text-white px-6 py-3 rounded-md font-medium"
              >
                Opret nyt produkt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 