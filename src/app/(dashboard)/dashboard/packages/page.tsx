'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  product_limit: number;
  price: number;
  is_active: boolean;
  is_popular: boolean;
  discount_price: number | null;
  discount_start_date: string | null;
  discount_end_date: string | null;
  created_at: string;
  updated_at: string;
  max_quantity?: number | null;
  sold_quantity?: number;
}

export default function PackagesPage() {
  const { supabase } = useSupabase()
  const [packages, setPackages] = useState<SubscriptionPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_weeks: '',
    product_limit: '',
    price: '',
    is_active: true,
    is_popular: false,
    discount_price: '',
    discount_start_date: '',
    discount_end_date: '',
    max_quantity: '', // Ny: antal tilgængelige
  })

  // Hent pakker
  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .order('price', { ascending: true })

      if (error) throw error
      setPackages(data || [])
    } catch (error) {
      console.error('Fejl ved hentning af pakker:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  // Opret eller opdater pakke
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const packageData = {
        name: formData.name,
        description: formData.description,
        duration_weeks: parseInt(formData.duration_weeks),
        product_limit: parseInt(formData.product_limit),
        price: parseFloat(formData.price),
        is_active: formData.is_active,
        is_popular: formData.is_popular,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        discount_start_date: formData.discount_start_date || null,
        discount_end_date: formData.discount_end_date || null,
        updated_at: new Date().toISOString(),
        max_quantity: formData.max_quantity ? parseInt(formData.max_quantity) : null,
      }

      if (editingPackage) {
        // Opdater eksisterende pakke
        // Opdater kun hvis id er gyldigt
        if (editingPackage && editingPackage.id) {
          const { error } = await supabase
            .from('subscription_packages')
            .update(packageData)
            .eq('id', editingPackage.id)

          if (error) throw error
        } else {
          throw new Error('Ugyldigt id til opdatering af abonnementspakke.');
        }

        // Hvis denne pakke er sat som populær, fjern populær status fra andre pakker
        if (packageData.is_popular && editingPackage && editingPackage.id) {
          await supabase
            .from('subscription_packages')
            .update({ is_popular: false })
            .neq('id', editingPackage.id)
        }

        // Revalider /packages siden
        await fetch('/packages', { method: 'GET', cache: 'reload' });
      } else {
        // Opret ny pakke
        const { error } = await supabase
          .from('subscription_packages')
          .insert([packageData])

        if (error) throw error

        // Hvis denne pakke er sat som populær, fjern populær status fra andre pakker
        if (packageData.is_popular) {
          await supabase
            .from('subscription_packages')
            .update({ is_popular: false })
            .neq('id', (editingPackage as SubscriptionPackage | null)?.id ?? '')
        }

        // Revalider /packages siden
        await fetch('/packages', { method: 'GET', cache: 'reload' });
      }

      // Nulstil form og hent opdaterede pakker
      setFormData({
        name: '',
        description: '',
        duration_weeks: '',
        product_limit: '',
        price: '',
        is_active: true,
        is_popular: false,
        discount_price: '',
        discount_start_date: '',
        discount_end_date: '',
        max_quantity: '', // Always include max_quantity
      })
      setEditingPackage(null)
      setIsOpen(false)
      fetchPackages()
    } catch (error) {
      console.error('Fejl ved gem af pakke:', error)
    }
  }

  // Slet pakke
  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne pakke?')) return

    try {
      const { error } = await supabase
        .from('subscription_packages')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchPackages()
    } catch (error) {
      console.error('Fejl ved sletning af pakke:', error)
    }
  }

  // Start redigering af pakke
  const handleEdit = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      description: pkg.description ?? '',
      duration_weeks: pkg.duration_weeks.toString(),
      product_limit: pkg.product_limit.toString(),
      price: pkg.price.toString(),
      is_active: pkg.is_active,
      is_popular: pkg.is_popular,
      discount_price: pkg.discount_price?.toString() || '',
      discount_start_date: pkg.discount_start_date || '',
      discount_end_date: pkg.discount_end_date || '',
      max_quantity: pkg.max_quantity !== undefined && pkg.max_quantity !== null ? pkg.max_quantity.toString() : '',
    })
    setIsOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1AA49A]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abonnementspakker</h1>
          <p className="mt-1 text-sm text-gray-500">Administrer dine abonnementspakker</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingPackage(null)
                setFormData({
                  name: '',
                  description: '',
                  duration_weeks: '',
                  product_limit: '',
                  price: '',
                  is_active: true,
                  is_popular: false,
                  discount_price: '',
                  discount_start_date: '',
                  discount_end_date: '',
                  max_quantity: '',
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Opret Pakke
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Rediger Pakke' : 'Opret Ny Pakke'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Navn</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="F.eks. Basic, Pro, Business"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Beskrivelse</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Beskriv pakkens fordele..."
                  />
                </div>
                <div>
                  <Label htmlFor="duration_weeks">Varighed (uger)</Label>
                  <Input
                    id="duration_weeks"
                    type="number"
                    min="1"
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_weeks: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product_limit">Antal produkter</Label>
                  <Input
                    id="product_limit"
                    type="number"
                    min="1"
                    value={formData.product_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_limit: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Normal pris (DKK)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_quantity">Antal tilgængelige (valgfrit)</Label>
                  <Input
                    id="max_quantity"
                    type="number"
                    min="1"
                    value={formData.max_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_quantity: e.target.value }))}
                    placeholder="Fx 100 for først-til-mølle, tom for uendelig"
                  />
                </div>
                <div>
                  <Label htmlFor="discount_price">Tilbudspris (DKK)</Label>
                  <Input
                    id="discount_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_price: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="discount_start_date">Tilbud start dato</Label>
                  <Input
                    id="discount_start_date"
                    type="datetime-local"
                    value={formData.discount_start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="discount_end_date">Tilbud slut dato</Label>
                  <Input
                    id="discount_end_date"
                    type="datetime-local"
                    value={formData.discount_end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_end_date: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-[#1AA49A] focus:ring-[#1AA49A]"
                  />
                  <Label htmlFor="is_active">Aktiv</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_popular"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_popular: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-[#1AA49A] focus:ring-[#1AA49A]"
                  />
                  <Label htmlFor="is_popular">Mest populær</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Annuller
                </Button>
                <Button type="submit">
                  {editingPackage ? 'Gem ændringer' : 'Opret pakke'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Navn
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Varighed
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produkter
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pris
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tilbud
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Handlinger</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {packages.map((pkg) => {
              const isDiscountActive = pkg.discount_price && 
                pkg.discount_start_date && 
                pkg.discount_end_date && 
                new Date(pkg.discount_start_date) <= new Date() && 
                new Date(pkg.discount_end_date) >= new Date()

              return (
                <tr key={pkg.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {pkg.name}
                        {pkg.is_popular && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1AA49A] text-white">
                            Mest populær
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pkg.duration_weeks} uger
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pkg.product_limit} produkter
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      {isDiscountActive ? (
                        <>
                          <span className="line-through text-gray-500">{pkg.price.toFixed(2)} kr.</span>
                          <span className="text-[#F08319] font-semibold">{pkg.discount_price?.toFixed(2)} kr.</span>
                        </>
                      ) : (
                        <span>{pkg.price.toFixed(2)} kr.</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isDiscountActive ? (
                      <span className="text-[#F08319]">
                        Aktiv til {new Date(pkg.discount_end_date!).toLocaleDateString('da-DK')}
                      </span>
                    ) : pkg.discount_price ? (
                      <span className="text-gray-500">
                        Starter {new Date(pkg.discount_start_date!).toLocaleDateString('da-DK')}
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      pkg.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pkg.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(pkg)}
                      className="text-[#1AA49A] hover:text-[#1AA49A]/80"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
} 