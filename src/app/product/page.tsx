'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { useSanitizedProducts, applyFilters } from '@/lib/customHooks';
import axios from 'axios';
import MockProductCard from '@/components/MockProductCard';
import { Select, SelectItem, Slider, Input, Button, Checkbox, Spinner } from '@nextui-org/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/components/Cart/CartProvider';
import { ShoppingCart } from 'lucide-react';

export default function ProductsPage() {
  // State for rå produkter og filtrerede produkter
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Filtrerings-state
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [sortOption, setSortOption] = useState<string>('latest');
  
  // Accordion state
  const [openAccordions, setOpenAccordions] = useState({
    search: true,
    category: true,
    price: true,
    sort: true
  });
  
  // Toggle accordion
  const toggleAccordion = (accordion: 'search' | 'category' | 'price' | 'sort') => {
    setOpenAccordions({
      ...openAccordions,
      [accordion]: !openAccordions[accordion]
    });
  };
  
  // Kategorier fra produkterne
  const [categories, setCategories] = useState<string[]>(['Alle']);
  
  // Brug vores custom hook til at rense produkt-data for visning
  const displayProducts = useSanitizedProducts(rawProducts);
  
  // Bevar originale produkt-ID'er og billeder for URL-generering
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const { addItem, toggleCart } = useCart();
  
  // Hent produkter fra API ved indlæsning
  useEffect(() => {
    fetchProducts();
    
    // Opsæt periodisk genindlæsning hvert 30. sekund
    const refreshInterval = setInterval(() => {
      console.log('Genindlæser produkter...');
      fetchProducts();
    }, 30000);
    
    // Ryd intervallet når komponenten unmounts
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Flyt fetchProducts til en separat funktion, så den kan genbruges
  async function fetchProducts() {
    try {
      setRefreshing(true);
      setError(null); // Nulstil fejl ved ny hentning
      
      // Tilføj timestamp for at undgå caching
      const timestamp = new Date().getTime();
      const response = await axios.get(`/api/products?t=${timestamp}`);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Ugyldigt svar fra serveren');
      }
      
      console.log('Nye produkter hentet:', response.data.length);
      
      // Sikr at vi har et array af produkter, selv hvis nogle mangler data
      const validProducts = response.data.map((product: any) => ({
        id: product.id || 'unknown',
        title: product.title || 'Unavailable',
        price: product.price || 0,
        description: product.description || '',
        category: product.category || 'Andet',
        images: Array.isArray(product.images) ? product.images : [],
        user: product.user || null,
        created_at: product.created_at || new Date().toISOString(),
        location: product.location || ''
      }));
      
      setRawProducts(validProducts);
      
      // Udtræk unikke kategorier fra produkterne
      const uniqueCategories = ['Alle', ...new Set(validProducts.map((product: Product) => product.category))];
      setCategories(uniqueCategories);
      
      // Find højeste pris til prisfilter
      const maxPrice = Math.max(...validProducts.map((product: Product) => product.price), 10000);
      setPriceRange([0, maxPrice]);
      
    } catch (err: any) {
      console.error('Fejl ved hentning af produkter:', err);
      setError(err.response?.data?.message || 'Der opstod en fejl ved indlæsning af produkter. Prøv igen senere.');
      // Behold eksisterende produkter hvis der er en fejl
      if (rawProducts.length === 0) {
        setRawProducts([]); // Kun nulstil hvis vi ikke har nogen produkter
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }
  
  // Anvend filtre når bruger ændrer søgekriterier eller når displayProducts opdateres
  useEffect(() => {
    // Brug applyFilters, men marker at vi vil bevare ID'erne til URL-generering
    const productsWithFilter = applyFilters(
      rawProducts, // Brug de oprindelige data med ID'er
      selectedCategory,
      searchQuery,
      priceRange,
      sortOption,
      true // keepIds parameter - bevar id'er
    );
    
    setFilteredProducts(productsWithFilter);
    console.log('Filtrerede produkter med bevarede ID:', productsWithFilter);
  }, [rawProducts, selectedCategory, searchQuery, priceRange, sortOption]);
  
  // Håndter søgning
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Søgningsfilteret anvendes allerede via useEffect ovenfor
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-[#0F172A]">Alle Produkter</h1>
        
        {/* Mobil filtrerings-toggle - kun synlig på mobil */}
        <div className="lg:hidden">
          <Button
            variant="flat"
            className="flex items-center gap-2"
            onClick={() => alert('Mobil filter menu ville åbne her')}
            size="sm"
          >
            <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
            <span>Filter</span>
          </Button>
        </div>
        
        {/* Kurv-ikon */}
        <div className="lg:hidden">
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <ShoppingCart className="w-6 h-6 text-[#1AA49A]" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtreringssektion - venstre side på desktop */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-20">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-[#0F172A] flex items-center">
                <FontAwesomeIcon icon={faFilter} className="mr-2 text-gray-500" />
                Filtrering
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {/* Søgefelt Accordion */}
              <div className="py-3 px-4">
                <button 
                  className="flex items-center justify-between w-full py-2 text-left focus:outline-none"
                  onClick={() => toggleAccordion('search')}
                >
                  <span className="text-sm font-medium text-gray-600">Søgning</span>
                  <span className="transform transition-transform duration-200">
                    {openAccordions.search ? '-' : '+'}
                  </span>
                </button>
                {openAccordions.search && (
                  <div className="pt-2">
                    <form onSubmit={handleSearch}>
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Søg efter produkter..."
                        startContent={<FontAwesomeIcon icon={faSearch} className="text-gray-400" />}
                        aria-label="Søg efter produkter"
                        className="bg-gray-50 hover:bg-gray-100 transition-all"
                        size="sm"
                        variant="flat"
                        classNames={{
                          inputWrapper: "bg-gray-50 hover:bg-gray-100 transition-all",
                        }}
                      />
                    </form>
                  </div>
                )}
              </div>
              
              {/* Kategori Accordion */}
              <div className="py-3 px-4">
                <button 
                  className="flex items-center justify-between w-full py-2 text-left focus:outline-none"
                  onClick={() => toggleAccordion('category')}
                >
                  <span className="text-sm font-medium text-gray-600">Kategori</span>
                  <span className="transform transition-transform duration-200">
                    {openAccordions.category ? '-' : '+'}
                  </span>
                </button>
                {openAccordions.category && (
                  <div className="pt-2">
                    <Select
                      placeholder="Alle kategorier"
                      selectedKeys={[selectedCategory]}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      aria-label="Vælg kategori"
                      size="sm"
                      variant="flat"
                      radius="sm"
                      classNames={{
                        trigger: "bg-gray-50 hover:bg-gray-100 transition-all",
                      }}
                    >
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} textValue={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
              
              {/* Prisinterval Accordion */}
              <div className="py-3 px-4">
                <button 
                  className="flex items-center justify-between w-full py-2 text-left focus:outline-none"
                  onClick={() => toggleAccordion('price')}
                >
                  <span className="text-sm font-medium text-gray-600">Prisinterval</span>
                  <span className="transform transition-transform duration-200">
                    {openAccordions.price ? '-' : '+'}
                  </span>
                </button>
                {openAccordions.price && (
                  <div className="pt-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-semibold text-gray-800 text-center mb-3">
                        {priceRange[0]} kr - {priceRange[1]} kr
                      </div>
                      <Slider
                        step={500}
                        minValue={0}
                        maxValue={10000}
                        value={priceRange}
                        onChange={setPriceRange as any}
                        className="max-w-full"
                        aria-label="Prisinterval"
                        color="primary"
                        size="sm"
                        showSteps={false}
                        showOutline={false}
                        radius="full"
                        classNames={{
                          track: "bg-gray-200",
                          thumb: "bg-[#1AA49A] shadow-md hover:shadow-lg",
                        }}
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>0 kr</span>
                        <span>5.000 kr</span>
                        <span>10.000 kr</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sortering Accordion */}
              <div className="py-3 px-4">
                <button 
                  className="flex items-center justify-between w-full py-2 text-left focus:outline-none"
                  onClick={() => toggleAccordion('sort')}
                >
                  <span className="text-sm font-medium text-gray-600">Sortering</span>
                  <span className="transform transition-transform duration-200">
                    {openAccordions.sort ? '-' : '+'}
                  </span>
                </button>
                {openAccordions.sort && (
                  <div className="pt-2">
                    <div>
                      <button 
                        className={`w-full text-left py-2 px-3 rounded-md mb-1 text-sm ${sortOption === 'latest' ? 'bg-[#1AA49A]/10 text-[#1AA49A] font-medium' : 'hover:bg-gray-50'}`}
                        onClick={() => setSortOption('latest')}
                      >
                        Nyeste først
                      </button>
                      <button 
                        className={`w-full text-left py-2 px-3 rounded-md mb-1 text-sm ${sortOption === 'price-low' ? 'bg-[#1AA49A]/10 text-[#1AA49A] font-medium' : 'hover:bg-gray-50'}`}
                        onClick={() => setSortOption('price-low')}
                      >
                        Pris (lav til høj)
                      </button>
                      <button 
                        className={`w-full text-left py-2 px-3 rounded-md mb-1 text-sm ${sortOption === 'price-high' ? 'bg-[#1AA49A]/10 text-[#1AA49A] font-medium' : 'hover:bg-gray-50'}`}
                        onClick={() => setSortOption('price-high')}
                      >
                        Pris (høj til lav)
                      </button>
                      <button 
                        className={`w-full text-left py-2 px-3 rounded-md mb-1 text-sm ${sortOption === 'name-asc' ? 'bg-[#1AA49A]/10 text-[#1AA49A] font-medium' : 'hover:bg-gray-50'}`}
                        onClick={() => setSortOption('name-asc')}
                      >
                        Navn (A-Å)
                      </button>
                      <button 
                        className={`w-full text-left py-2 px-3 rounded-md text-sm ${sortOption === 'name-desc' ? 'bg-[#1AA49A]/10 text-[#1AA49A] font-medium' : 'hover:bg-gray-50'}`}
                        onClick={() => setSortOption('name-desc')}
                      >
                        Navn (Å-A)
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Reset knap */}
              <div className="py-3 px-4">
                <Button
                  color="default"
                  variant="flat"
                  radius="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategory('Alle');
                    setSearchQuery('');
                    setPriceRange([0, 10000]);
                    setSortOption('latest');
                  }}
                  size="sm"
                >
                  Nulstil filtre
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Produktliste - højre side på desktop */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
              <Spinner size="lg" color="primary" />
              <span className="ml-2 text-gray-700">Indlæser produkter...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 shadow-sm">
              <h3 className="font-semibold mb-1">Der opstod en fejl</h3>
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Resultater tæller og sorteringsvisning på mobil */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="text-gray-600 font-medium flex items-center gap-2">
                    Viser {filteredProducts.length} produkt{filteredProducts.length !== 1 ? 'er' : ''}
                    
                    {/* Opdateringsknap - synlig på alle skærmstørrelser */}
                    <Button
                      color="primary"
                      variant="flat"
                      isIconOnly
                      size="sm"
                      onClick={fetchProducts}
                      isLoading={refreshing}
                      aria-label="Opdater produkter"
                      title="Opdater produkter"
                      className="ml-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </Button>
                    
                    {refreshing && 
                      <span className="text-xs text-gray-500">Opdaterer...</span>
                    }
                  </div>
                  
                  {/* Vis sortering og nulstil på mobil */}
                  <div className="flex md:hidden items-center gap-2 w-full sm:w-auto">
                    <Select
                      placeholder="Sorter efter"
                      selectedKeys={[sortOption]}
                      onChange={(e) => setSortOption(e.target.value)}
                      aria-label="Vælg sorteringsmetode"
                      size="sm"
                      className="w-full sm:max-w-[180px]"
                      variant="flat"
                      classNames={{
                        trigger: "bg-gray-50 hover:bg-gray-100 transition-all",
                      }}
                    >
                      <SelectItem key="latest" value="latest">Nyeste først</SelectItem>
                      <SelectItem key="price-low" value="price-low">Pris (lav til høj)</SelectItem>
                      <SelectItem key="price-high" value="price-high">Pris (høj til lav)</SelectItem>
                      <SelectItem key="name-asc" value="name-asc">Navn (A-Å)</SelectItem>
                      <SelectItem key="name-desc" value="name-desc">Navn (Å-A)</SelectItem>
                    </Select>
                    
                    <Button
                      color="default"
                      variant="flat"
                      isIconOnly
                      size="sm"
                      onClick={() => {
                        setSelectedCategory('Alle');
                        setSearchQuery('');
                        setPriceRange([0, 10000]);
                        setSortOption('latest');
                      }}
                      aria-label="Nulstil filtre"
                      title="Nulstil filtre"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
              
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="product-item">
                      <style jsx>{`
                        .product-item [class*="f2803689"],
                        .product-item [id*="f2803689"] {
                          display: none !important;
                        }
                      `}</style>
                      <MockProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-xl text-center border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-semibold mb-2 text-[#0F172A]">Ingen produkter fundet</h3>
                  <p className="text-gray-600">
                    Prøv at justere dine filtre eller søg efter noget andet.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Kurv-ikon på desktop */}
      <div className="lg:hidden">
        <button
          onClick={toggleCart}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
        >
          <ShoppingCart className="w-6 h-6 text-[#1AA49A]" />
        </button>
      </div>
    </div>
  );
} 