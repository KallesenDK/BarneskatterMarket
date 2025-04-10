'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SubscriptionPackage } from '@/lib/types'

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
    discount_end_date: ''
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
        is_active: true,
        is_popular: false,
        discount_price: '',
        discount_start_date: '',
        discount_end_date: ''
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
      description: pkg.description || '',
      duration_weeks: pkg.duration_weeks.toString(),
      product_limit: pkg.product_limit.toString(),
      price: pkg.price.toString(),
      is_active: pkg.is_active,
      is_popular: pkg.is_popular,
      discount_price: pkg.discount_price?.toString() || '',
      discount_start_date: pkg.discount_start_date || '',
      discount_end_date: pkg.discount_end_date || ''
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
          <h1 className="text-2xl font-bold text-gray-900">Abonnements Pakker</h1>
          <p className="mt-1 text-sm text-gray-500">Administrer dine abonnements pakker</p>
        </div>
        
        <Button onClick={() => {
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
            discount_end_date: ''
          })
          setIsOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Opret Pakke
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Navn</TableHead>
            <TableHead>Beskrivelse</TableHead>
            <TableHead>Varighed</TableHead>
            <TableHead>Produkt Limit</TableHead>
            <TableHead>Pris</TableHead>
            <TableHead>Rabat</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Populær</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell className="font-medium">{pkg.name}</TableCell>
              <TableCell>{pkg.description}</TableCell>
              <TableCell>{pkg.duration_weeks} uger</TableCell>
              <TableCell>{pkg.product_limit} produkter</TableCell>
              <TableCell>{pkg.price.toFixed(2)} DKK</TableCell>
              <TableCell>
                {pkg.discount_price ? (
                  <div className="text-sm">
                    <div className="font-medium text-[#1AA49A]">{pkg.discount_price.toFixed(2)} DKK</div>
                    <div className="text-gray-500">
                      {new Date(pkg.discount_start_date!).toLocaleDateString('da-DK')} - 
                      {new Date(pkg.discount_end_date!).toLocaleDateString('da-DK')}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  pkg.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {pkg.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  pkg.is_popular
                    ? 'bg-[#1AA49A]/20 text-[#1AA49A]'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {pkg.is_popular ? 'Ja' : 'Nej'}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                placeholder="F.eks. Basic, Pro, Enterprise"
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
                  placeholder="4"
                  required
                />
              </div>
              <div>
                <Label htmlFor="product_limit">Produkt Limit</Label>
                <Input
                  id="product_limit"
                  type="number"
                  min="1"
                  value={formData.product_limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_limit: e.target.value }))}
                  placeholder="10"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Normal Pris (DKK)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="99.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="discount_price">Rabatpris (DKK)</Label>
                <Input
                  id="discount_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_price: e.target.value }))}
                  placeholder="79.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_start_date">Rabat start</Label>
                <Input
                  id="discount_start_date"
                  type="date"
                  value={formData.discount_start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="discount_end_date">Rabat slut</Label>
                <Input
                  id="discount_end_date"
                  type="date"
                  value={formData.discount_end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-[#1AA49A] focus:ring-[#1AA49A] border-gray-300 rounded"
                />
                <Label htmlFor="is_active">Aktiv</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_popular"
                  checked={formData.is_popular}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_popular: e.target.checked }))}
                  className="h-4 w-4 text-[#1AA49A] focus:ring-[#1AA49A] border-gray-300 rounded"
                />
                <Label htmlFor="is_popular">Mest populær</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Annuller
              </Button>
              <Button
                type="submit"
                className="bg-[#1AA49A] text-white hover:bg-[#1AA49A]/90"
              >
                {editingPackage ? 'Gem ændringer' : 'Opret pakke'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 