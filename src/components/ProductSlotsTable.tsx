import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditPackage, CreditPackageCard } from './CreditPackageCard';

interface GridSettings {
  sm: number;
  md: number;
  lg: number;
}

const defaultGridSettings: GridSettings = {
  sm: 2,
  md: 3,
  lg: 4
};

export default function ProductSlotsTable() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [gridSettings, setGridSettings] = useState<GridSettings>(defaultGridSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hent kredit pakker
        const { data: packagesData, error: packagesError } = await supabase
          .from('credit_packages')
          .select('*')
          .eq('is_active', true)
          .order('credits', { ascending: true });

        if (packagesError) throw packagesError;
        setCreditPackages(packagesData || []);

        // Hent grid indstillinger
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'credit_packages_grid')
          .single();

        if (settingsError) {
          console.warn('Kunne ikke hente grid indstillinger, bruger standard:', settingsError);
        } else if (settingsData) {
          setGridSettings(settingsData.value as GridSettings);
        }
      } catch (error) {
        console.error('Fejl ved hentning af data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const handleSelectPackage = (pkg: CreditPackage) => {
    router.push(`/checkout?package=${pkg.id}`);
  };

  // Generer grid klasser baseret på indstillinger
  const gridClass = `grid grid-cols-1 sm:grid-cols-${gridSettings.sm} lg:grid-cols-${gridSettings.md} xl:grid-cols-${gridSettings.lg} gap-6`;

  if (loading) {
    return (
      <div className={gridClass}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-96 bg-white rounded-2xl animate-pulse shadow-lg" />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className={gridClass}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {creditPackages.map((pkg, index) => (
        <motion.div
          key={pkg.id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
        >
          <CreditPackageCard
            pkg={pkg}
            onSelect={handleSelectPackage}
          />
        </motion.div>
      ))}
    </motion.div>
  );
} 