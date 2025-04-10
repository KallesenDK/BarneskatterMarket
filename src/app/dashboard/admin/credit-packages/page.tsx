'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react'
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

interface CreditPackage {
  id: string
  name: string
  description: string | null
  credits: number
  price: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function CreditPackagesPage() {
  const { supabase } = useSupabase()
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credits: '',
    price: '',
    is_active: true
  })

  // Hent kredit pakker
  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .order('credits', { ascending: true })

      if (error) throw error
      setPackages(data || [])
    } catch (error) {
      console.error('Fejl ved hentning af kredit pakker:', error)
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
        credits: parseInt(formData.credits),
        price: parseFloat(formData.price),
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      }

      if (editingPackage) {
        // Opdater eksisterende pakke
        const { error } = await supabase
          .from('credit_packages')
          .update(packageData)
          .eq('id', editingPackage.id)

        if (error) throw error
      } else {
        // Opret ny pakke
        const { error } = await supabase
          .from('credit_packages')
          .insert([packageData])

        if (error) throw error
      }

      // Nulstil form og hent opdaterede pakker
      setFormData({
        name: '',
        description: '',
        credits: '',
        price: '',
        is_active: true
      })
      setEditingPackage(null)
      setIsOpen(false)
      fetchPackages()
    } catch (error) {
      console.error('Fejl ved gem af kredit pakke:', error)
    }
  }

  // Slet pakke
  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne kredit pakke?')) return

    try {
      const { error } = await supabase
        .from('credit_packages')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchPackages()
    } catch (error) {
      console.error('Fejl ved sletning af kredit pakke:', error)
    }
  }

  // Start redigering af pakke
  const handleEdit = (pkg: CreditPackage) => {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      credits: pkg.credits.toString(),
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
          <h1 className="text-2xl font-bold text-gray-900">Kredit Pakker</h1>
          <p className="mt-1 text-sm text-gray-500">Administrer dine kredit pakker</p>
        </div>
        
        <Button onClick={() => {
          setEditingPackage(null)
          setFormData({
            name: '',
            description: '',
            credits: '',
            price: '',
            is_active: true
          })
          setIsOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Opret Kredit Pakke
        </Button>
      </div>

      <div className="space-y-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{pkg.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">{pkg.description}</p>
                  <div className="mt-2 space-x-4">
                    <span className="text-sm text-gray-500">{pkg.credits} kreditter</span>
                    <span className="text-sm text-gray-500">{pkg.price.toFixed(2)} DKK</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      pkg.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pkg.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
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
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kredit Pakke Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? 'Rediger Kredit Pakke' : 'Opret Ny Kredit Pakke'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Navn</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="F.eks. 100 Kreditter, 500 Kreditter"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beskriv kredit pakkens fordele"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credits">Antal kreditter</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  value={formData.credits}
                  onChange={(e) => setFormData(prev => ({ ...prev, credits: e.target.value }))}
                  placeholder="100"
                  required
                />
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
            </div>
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
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
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
  )
} 