'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface CreatePackageModalProps {
  show: boolean
  onClose: () => void
  onSuccess: () => void
}

const defaultPackage = {
  name: '',
  duration: 1,
  product_limit: 1,
  price: 0,
  is_popular: false,
  is_active: true,
  sale_price: undefined,
  sale_end_date: undefined
}

export function CreatePackageModal({ show, onClose, onSuccess }: CreatePackageModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(defaultPackage)

  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('packages')
        .insert([{
          name: formData.name,
          duration: formData.duration,
          product_limit: formData.product_limit,
          price: formData.price,
          is_popular: formData.is_popular,
          is_active: formData.is_active,
          sale_price: formData.sale_price,
          sale_end_date: formData.sale_end_date
        }])

      if (error) throw error

      setFormData(defaultPackage)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating package:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opret ny pakke</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Navn</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Varighed (uger)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product_limit">Antal produkter</Label>
            <Input
              id="product_limit"
              type="number"
              min="1"
              value={formData.product_limit}
              onChange={(e) => setFormData({ ...formData, product_limit: parseInt(e.target.value) })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Pris (kr.)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale_price">Tilbudspris (kr.)</Label>
            <Input
              id="sale_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.sale_price || ''}
              onChange={(e) => setFormData({ ...formData, sale_price: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale_end_date">Tilbud slutter</Label>
            <Input
              id="sale_end_date"
              type="date"
              value={formData.sale_end_date || ''}
              onChange={(e) => setFormData({ ...formData, sale_end_date: e.target.value || undefined })}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_popular"
              checked={formData.is_popular}
              onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
            />
            <Label htmlFor="is_popular">Mest populær</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Aktiv</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Annuller
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Opretter...' : 'Opret pakke'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 