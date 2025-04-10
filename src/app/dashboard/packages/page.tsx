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
  id: string
  name: string
  description: string
  duration_weeks: number
  product_limit: number
  price: number
  is_active: boolean
  created_at: string
  updated_at: string
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
    is_active: true
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
        updated_at: new Date().toISOString()
      }

      if (editingPackage) {
        // Opdater eksisterende pakke
        const { error } = await supabase
          .from('subscription_packages')
          .update(packageData)
          .eq('id', editingPackage.id)

        if (error) throw error
      } else {
        // Opret ny pakke
        const { error } = await supabase
          .from('subscription_packages')
          .insert([packageData])

        if (error) throw error
      }

      // Nulstil form og hent opdaterede pakker
      setFormData({
        name: '',
        description: '',
        duration_weeks: '',
        product_limit: '',
        price: '',
        is_active: true
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
      description: pkg.description,
      duration_weeks: pkg.duration_weeks.toString(),
      product_limit: pkg.product_limit.toString(),
      price: pkg.price.toString(),
      is_active: pkg.is_active
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
                  is_active: true
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Opret Pakke
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Rediger Pakke' : 'Opret Ny Pakke'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="F.eks. Basic, Pro, Business"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Beskrivelse</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beskriv pakkens fordele"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration_weeks">Varighed (uger)</Label>
                  <Input
                    id="duration_weeks"
                    type="number"
                    min="1"
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_weeks: e.target.value }))}
                    placeholder="2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product_limit">Produkt grænse</Label>
                  <Input
                    id="product_limit"
                    type="number"
                    min="1"
                    value={formData.product_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_limit: e.target.value }))}
                    placeholder="4"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="price">Pris (DKK)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="49.00"
                  required
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
                <Label htmlFor="is_active">Aktiv pakke</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Annuller
                </Button>
                <Button type="submit">
                  {editingPackage ? 'Gem Ændringer' : 'Opret Pakke'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Navn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Beskrivelse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Varighed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Produkter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Pris
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pkg.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {pkg.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pkg.duration_weeks} uger
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pkg.product_limit} produkter
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pkg.price.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      pkg.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pkg.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(pkg)}
                      className="mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {packages.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Ingen pakker fundet. Opret din første pakke ved at klikke på "Opret Pakke" knappen.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 