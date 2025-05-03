import { getGridSettings } from '@/lib/grid-settings'
import { createClient } from '@/lib/supabase/server'
import { SubscriptionPackageCard } from '@/components/SubscriptionPackageCard'
import { revalidatePath } from 'next/cache'

interface SubscriptionPackage {
  id: string
  name: string
  description: string
  duration_weeks: number
  product_limit: number
  price: number
  is_active: boolean
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PackagesPage() {
  try {
    // Revalider siden
    revalidatePath('/packages', 'page')
    
    const supabase = createClient()
    console.log('Supabase client created')

    const gridSettings = await getGridSettings('subscription_packages_grid')
    console.log('Grid settings:', gridSettings)

    const { data: packages, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('is_active', true)
      .order('price')

    if (error) {
      console.error('Error fetching packages:', error)
      return (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">Abonnementspakker</h1>
          <p className="text-red-500">Der opstod en fejl ved hentning af pakker: {error.message}</p>
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )
    }

    console.log('Packages data:', packages)

    if (!packages || packages.length === 0) {
      return (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">Abonnementspakker</h1>
          <p>Der er ingen tilgængelige pakker i øjeblikket.</p>
        </div>
      )
    }

    return (
      <main 
        className="min-h-screen bg-gray-50"
        style={{
          '--grid-cols-sm': gridSettings.sm,
          '--grid-cols-md': gridSettings.md,
          '--grid-cols-lg': gridSettings.lg,
        } as any}
      >
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">Abonnementspakker</h1>
          <div className="grid gap-6 grid-cols-[repeat(var(--grid-cols-sm),1fr)] md:grid-cols-[repeat(var(--grid-cols-md),1fr)] lg:grid-cols-[repeat(var(--grid-cols-lg),1fr)]">
            {packages.map((pkg) => (
              <SubscriptionPackageCard key={pkg.id} package={pkg} />
            ))}
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Abonnementspakker</h1>
        <p className="text-red-500">Der opstod en uventet fejl.</p>
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    )
  }
} 