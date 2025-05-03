'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileUpdateModalProps {
  open: boolean
  onClose: () => void
  profile: any
}

export default function ProfileUpdateModal({ open, onClose, profile: currentProfile }: ProfileUpdateModalProps) {
  const { supabase } = useSupabase()
  const [formData, setFormData] = useState({
    address: currentProfile?.address || '',
    postal_code: currentProfile?.postal_code || '',
    phone: currentProfile?.phone || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentProfile?.id) return

    const { error } = await supabase
      .from('profiles')
      .update({
        address: formData.address,
        postal_code: formData.postal_code,
        phone: formData.phone
      })
      .eq('id', currentProfile.id)

    if (!error) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opdater din profil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postnummer</Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" className="w-full">Gem ændringer</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 