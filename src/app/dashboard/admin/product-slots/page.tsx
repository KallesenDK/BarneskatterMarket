'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ProductSlot {
  id: string;
  name: string;
  slots: number;
  price: number;
  description: string;
  is_active: boolean;
}

export default function AdminProductSlotsPage() {
  const { supabase } = useSupabase();
  const [productSlots, setProductSlots] = useState<ProductSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ProductSlot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slots: '',
    price: '',
    is_active: true
  });

  // Hent product slots
  const fetchProductSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('product_slots')
        .select('*')
        .order('slots', { ascending: true });

      if (error) throw error;
      setProductSlots(data || []);
    } catch (error) {
      console.error('Fejl ved hentning af product slots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductSlots();
  }, []);

  // Håndter form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slotData = {
        name: formData.name,
        description: formData.description,
        slots: parseInt(formData.slots),
        price: parseFloat(formData.price),
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingSlot) {
        // Opdater eksisterende slot
        const { error } = await supabase
          .from('product_slots')
          .update(slotData)
          .eq('id', editingSlot.id);

        if (error) throw error;
      } else {
        // Opret ny slot
        const { error } = await supabase
          .from('product_slots')
          .insert([slotData]);

        if (error) throw error;
      }

      // Nulstil form og hent opdaterede data
      setFormData({
        name: '',
        description: '',
        slots: '',
        price: '',
        is_active: true
      });
      setEditingSlot(null);
      setIsOpen(false);
      fetchProductSlots();
    } catch (error) {
      console.error('Fejl ved gem af product slot:', error);
    }
  };

  // Start redigering af slot
  const handleEdit = (slot: ProductSlot) => {
    setEditingSlot(slot);
    setFormData({
      name: slot.name,
      description: slot.description,
      slots: slot.slots.toString(),
      price: slot.price.toString(),
      is_active: slot.is_active
    });
    setIsOpen(true);
  };

  // Slet slot
  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne produktplads?')) return;

    try {
      const { error } = await supabase
        .from('product_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProductSlots();
    } catch (error) {
      console.error('Fejl ved sletning af product slot:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1AA49A]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produktpladser</h1>
          <p className="mt-1 text-sm text-gray-500">Administrer dine produktpladser</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingSlot(null);
                setFormData({
                  name: '',
                  description: '',
                  slots: '',
                  price: '',
                  is_active: true
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Opret Produktplads
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSlot ? 'Rediger Produktplads' : 'Opret Ny Produktplads'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Navn</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="F.eks. 5 Ekstra pladser"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Beskrivelse</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Beskriv produktpladsen"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slots">Antal pladser</Label>
                    <Input
                      id="slots"
                      type="number"
                      min="1"
                      value={formData.slots}
                      onChange={(e) => setFormData(prev => ({ ...prev, slots: e.target.value }))}
                      placeholder="5"
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
                      placeholder="199.00"
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
                    className="h-4 w-4 rounded border-gray-300 text-[#1AA49A] focus:ring-[#1AA49A]"
                  />
                  <Label htmlFor="is_active">Aktiv produktplads</Label>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Annuller
                  </Button>
                  <Button type="submit">
                    {editingSlot ? 'Gem Ændringer' : 'Opret Produktplads'}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
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
                  Antal
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
            <tbody className="divide-y divide-gray-200">
              {productSlots.map((slot) => (
                <tr key={slot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {slot.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {slot.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {slot.slots} pladser
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {slot.price.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      slot.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {slot.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(slot)}
                      className="mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(slot.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {productSlots.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Ingen produktpladser fundet. Opret din første produktplads ved at klikke på "Opret Produktplads" knappen.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 