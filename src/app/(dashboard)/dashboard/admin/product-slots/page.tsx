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

interface ProductSlot {
  id: string
  name: string
  description: string | null
  slot_count: number
  price: number
  is_active: boolean
  is_popular: boolean
  discount_price: number | null
  discount_start_date: string | null
  discount_end_date: string | null
  created_at: string
  updated_at: string | null
}

export default function ProductSlotsPage() {
  const { supabase } = useSupabase()
  const [slots, setSlots] = useState<ProductSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<ProductSlot | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slot_count: '',
    price: '',
    is_active: true,
    is_popular: false,
    discount_price: '',
    discount_start_date: '',
    discount_end_date: ''
  })

  // Hent slots
  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('product_slots')
        .select('*')
        .order('price', { ascending: true })

      if (error) {
        console.error('Database fejl:', error)
        throw error
      }

      if (!data) {
        console.warn('Ingen slots fundet')
        setSlots([])
        return
      }

      // Valider data før vi gemmer det
      const validatedSlots = data.map(slot => ({
        id: slot.id || '',
        name: slot.name || '',
        description: slot.description || '',
        slot_count: typeof slot.slot_count === 'number' ? slot.slot_count : 0,
        price: typeof slot.price === 'number' ? slot.price : 0,
        is_active: Boolean(slot.is_active),
        is_popular: Boolean(slot.is_popular),
        discount_price: typeof slot.discount_price === 'number' ? slot.discount_price : null,
        discount_start_date: slot.discount_start_date || null,
        discount_end_date: slot.discount_end_date || null,
        created_at: slot.created_at || new Date().toISOString(),
        updated_at: slot.updated_at || null
      }))

      setSlots(validatedSlots)
    } catch (error) {
      console.error('Fejl ved hentning af slots:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [])

  // Opret eller opdater slot
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with data:', formData)
    
    try {
      const slotData = {
        name: formData.name,
        description: formData.description || '',
        slot_count: parseInt(formData.slot_count) || 0,
        price: parseFloat(formData.price) || 0,
        is_active: formData.is_active,
        is_popular: formData.is_popular,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        discount_start_date: formData.discount_start_date || null,
        discount_end_date: formData.discount_end_date || null,
        updated_at: new Date().toISOString()
      }

      console.log('Prepared slot data:', slotData)

      if (editingSlot) {
        console.log('Updating existing slot with ID:', editingSlot.id)
        // Opdater eksisterende slot
        const { data, error } = await supabase
          .from('product_slots')
          .update(slotData)
          .eq('id', editingSlot.id)
          .select()

        console.log('Update response:', { data, error })

        if (error) {
          console.error('Fejl ved opdatering af slot:', error)
          alert('Fejl ved opdatering af slot: ' + error.message)
          return
        }

        // Hvis denne slot er sat som populær, fjern populær status fra andre slots
        if (slotData.is_popular) {
          console.log('Updating popular status for other slots')
          const { error: popularError } = await supabase
            .from('product_slots')
            .update({ is_popular: false })
            .neq('id', editingSlot.id)

          if (popularError) {
            console.error('Fejl ved opdatering af populær status:', popularError)
          }
        }
      } else {
        console.log('Creating new slot via API')
        try {
          const response = await fetch('/api/create-product-slot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(slotData),
          });
          const result = await response.json();
          console.log('API response:', result);
          if (!response.ok || result.error) {
            const message = result.error || 'Ukendt fejl ved oprettelse af slot';
            alert('Fejl ved oprettelse af slot: ' + message);
            return;
          }
        } catch (apiError: any) {
          console.error('Fejl ved oprettelse af slot via API:', apiError);
          alert('Fejl ved oprettelse af slot: ' + (apiError.message || apiError));
          return;
        }
      }

      console.log('Operation completed successfully')
      // Nulstil form og hent opdaterede slots
      setFormData({
        name: '',
        description: '',
        slot_count: '',
        price: '',
        is_active: true,
        is_popular: false,
        discount_price: '',
        discount_start_date: '',
        discount_end_date: ''
      })
      setEditingSlot(null)
      setIsOpen(false)
      fetchSlots()
    } catch (error) {
      console.error('Uventet fejl ved gem af slot:', error)
      alert('Der opstod en uventet fejl. Prøv igen.')
    }
  }

  // Slet slot
  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne slot?')) return

    try {
      const { error } = await supabase
        .from('product_slots')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchSlots()
    } catch (error) {
      console.error('Fejl ved sletning af slot:', error)
    }
  }

  // Start redigering af slot
  const handleEdit = (slot: ProductSlot) => {
    try {
      setEditingSlot(slot)
      setFormData({
        name: slot?.name || '',
        description: slot?.description || '',
        slot_count: slot?.slot_count ? slot.slot_count.toString() : '',
        price: slot?.price ? slot.price.toString() : '',
        is_active: slot?.is_active || false,
        is_popular: slot?.is_popular || false,
        discount_price: slot?.discount_price ? slot.discount_price.toString() : '',
        discount_start_date: slot?.discount_start_date || '',
        discount_end_date: slot?.discount_end_date || ''
      })
      setIsOpen(true)
    } catch (error) {
      console.error('Fejl ved redigering af slot:', error)
      // Vis eventuelt en fejlmeddelelse til brugeren her
    }
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
          <h1 className="text-2xl font-bold text-[#1AA49A]">Produkt Slots</h1>
          <p className="mt-1 text-sm text-gray-500">Administrer dine produkt slots</p>
        </div>
        
        <Button onClick={() => {
          setEditingSlot(null)
          setFormData({
            name: '',
            description: '',
            slot_count: '',
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
          Opret Slot
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NAVN</TableHead>
              <TableHead>BESKRIVELSE</TableHead>
              <TableHead>ANTAL SLOTS</TableHead>
              <TableHead>PRIS</TableHead>
              <TableHead>TILBUD</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="text-right">HANDLINGER</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.map((slot) => {
              const isDiscountActive = slot.discount_price && 
                slot.discount_start_date && 
                slot.discount_end_date && 
                new Date(slot.discount_start_date) <= new Date() && 
                new Date(slot.discount_end_date) >= new Date()

              return (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {slot.name}
                      {slot.is_popular && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1AA49A] text-white">
                          Mest populær
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{slot.description}</TableCell>
                  <TableCell>{slot.slot_count} slots</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {isDiscountActive ? (
                        <>
                          <span className="line-through text-gray-500">{slot.price.toFixed(2)} kr.</span>
                          <span className="text-[#F08319] font-semibold">{slot.discount_price?.toFixed(2)} kr.</span>
                        </>
                      ) : (
                        <span>{slot.price.toFixed(2)} kr.</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isDiscountActive ? (
                      <span className="text-[#F08319]">
                        Aktiv til {new Date(slot.discount_end_date!).toLocaleDateString('da-DK')}
                      </span>
                    ) : slot.discount_price ? (
                      <span className="text-gray-500">
                        Starter {new Date(slot.discount_start_date!).toLocaleDateString('da-DK')}
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      slot.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {slot.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(slot)}
                      className="text-[#1AA49A] hover:text-[#1AA49A]/80"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(slot.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingSlot ? 'Rediger slot' : 'Opret ny slot'}
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
                  placeholder="Basic Slot Pakke"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Beskrivelse</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Perfekt til lejlighedsvise sælgere"
                />
              </div>
              <div>
                <Label htmlFor="slot_count">Antal Slots</Label>
                <Input
                  id="slot_count"
                  type="number"
                  min="1"
                  value={formData.slot_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, slot_count: e.target.value }))}
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
              <div className="col-span-2">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-gray-300 text-[#1AA49A] focus:ring-[#1AA49A]"
                    />
                    <span>Aktiv</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_popular}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_popular: e.target.checked }))}
                      className="rounded border-gray-300 text-[#1AA49A] focus:ring-[#1AA49A]"
                    />
                    <span>Mest populær</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Annuller
              </Button>
              <Button type="submit">
                {editingSlot ? 'Gem ændringer' : 'Opret slot'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 