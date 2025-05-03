import { getGridSettings } from '@/lib/grid-settings'
import { createClient } from '@/lib/supabase/server'
import { ProductSlotCard } from '@/components/ProductSlotCard'

interface ProductSlot {
  id: string;
  name: string;
  description: string | null;
  slot_count: number;
  price: number;
  is_active: boolean;
  is_popular: boolean;
  discount_price: number | null;
  discount_start_date: string | null;
  discount_end_date: string | null;
}

export const dynamic = 'force-dynamic'

export default async function ProductSlotsPage() {
  try {
    const supabase = createClient()
    console.log('Supabase client created')
    
    const gridSettings = await getGridSettings('credit_packages_grid')
    console.log('Grid settings:', gridSettings)

    const { data: slots, error } = await supabase
      .from('product_slots')
      .select('*')
      .eq('is_active', true)
      .order('price')

    if (error) {
      console.error('Error fetching slots:', error)
      return (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">Ekstra Produktpladser</h1>
          <p className="text-red-500">Der opstod en fejl ved hentning af produktpladser: {error.message}</p>
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )
    }

    console.log('Slots data:', slots)

    if (!slots || slots.length === 0) {
      return (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">Ekstra Produktpladser</h1>
          <p>Der er ingen tilgængelige produktpladser i øjeblikket.</p>
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
          <h1 className="text-2xl font-bold mb-6">Ekstra Produktpladser</h1>
          <div className="grid gap-6 grid-cols-[repeat(var(--grid-cols-sm),1fr)] md:grid-cols-[repeat(var(--grid-cols-md),1fr)] lg:grid-cols-[repeat(var(--grid-cols-lg),1fr)]">
            {slots.map((slot) => (
              <ProductSlotCard key={slot.id} slot={slot} />
            ))}
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Ekstra Produktpladser</h1>
        <p className="text-red-500">Der opstod en uventet fejl.</p>
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    )
  }
} 