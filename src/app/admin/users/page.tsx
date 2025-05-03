'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { Plus, Pencil, Trash2, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

interface User {
  id: string;
  email: string;
  created_at: string;
  role: string;
  profile: {
    first_name?: string | null;
    last_name?: string | null;
    address?: string | null;
    postal_code?: string | null;
    phone?: string | null;
    banned_until?: string | null;
    credits?: number | null;
    avatar_url?: string | null;
    subscription_end_date?: string | null;
  };
}

interface UserBan {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

function isValidUser(user: any): user is { id: string; email: string } {
  return user && typeof user === 'object' && typeof user.id === 'string' && typeof user.email === 'string';
}

export default function UsersPage() {
  const { supabase } = useSupabase();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isBanOpen, setIsBanOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
    first_name: '',
    last_name: '',
    address: '',
    postal_code: '',
    phone: '',
  });
  const [banData, setBanData] = useState({
    reason: '',
    start_date: '',
    end_date: '',
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/signin';
        return;
      }

      const isAdminUser = session.user.email === 'kenneth@sigmatic.dk';
      setIsAdmin(isAdminUser);
      
      if (!isAdminUser) {
        window.location.href = '/dashboard';
        return;
      }

      setLoading(false);
      fetchUsers();
    };

    checkAdminAccess();
  }, [supabase]);

  // Hent brugere
  const fetchUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          address,
          postal_code,
          phone,
          banned_until,
          credits,
          avatar_url,
          subscription_end_date,
          role,
          auth_users(id, email, created_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our User interface
      let transformedUsers: User[] = [];

      if (Array.isArray(users)) {
        transformedUsers = users.map(user => ({
          id: user.id,
          email: user.auth_users?.[0]?.email ?? '',
          created_at: user.auth_users?.[0]?.created_at ?? '',
          role: user.role,
          profile: {
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            address: user.address ?? '',
            postal_code: user.postal_code ?? '',
            phone: user.phone ?? '',
            banned_until: user.banned_until ?? null,
            credits: user.credits ?? 0,
            avatar_url: user.avatar_url ?? null,
            subscription_end_date: user.subscription_end_date ?? null,
          },
        }));
      } else {
        console.error('Supabase users-data er ikke et array af kun brugere:', users);
      }
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Fejl ved hentning af brugere:', error);
    } finally {
      setLoading(false);
    }
  };

  // Opret ny bruger
  const handleCreateUser = async () => {
    try {
      // Opret bruger i auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Opret profil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            address: formData.address,
            postal_code: formData.postal_code,
            phone: formData.phone,
            role: formData.role,
            credits: 0,
          });

        if (profileError) throw profileError;

        // Opdater liste
        fetchUsers();
        setIsOpen(false);
        setFormData({
          email: '',
          password: '',
          role: 'user',
          first_name: '',
          last_name: '',
          address: '',
          postal_code: '',
          phone: '',
        });
      }
    } catch (error) {
      console.error('Fejl ved oprettelse af bruger:', error);
    }
  };

  // Opdater bruger
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          address: formData.address,
          postal_code: formData.postal_code,
          phone: formData.phone,
          role: formData.role,
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      fetchUsers();
      setIsOpen(false);
      setSelectedUser(null);
      setFormData({
        email: '',
        password: '',
        role: 'user',
        first_name: '',
        last_name: '',
        address: '',
        postal_code: '',
        phone: '',
      });
    } catch (error) {
      console.error('Fejl ved opdatering af bruger:', error);
    }
  };

  // Slet bruger
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Er du sikker på, at du vil slette denne bruger?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      fetchUsers();
    } catch (error) {
      console.error('Fejl ved sletning af bruger:', error);
    }
  };

  // Ban bruger
  const handleBanUser = async () => {
    if (!selectedUser) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_bans')
        .insert({
          user_id: selectedUser.id,
          banned_by: user.id,
          reason: banData.reason,
          start_date: banData.start_date,
          end_date: banData.end_date,
        });

      if (error) throw error;

      setIsBanOpen(false);
      setSelectedUser(null);
      setBanData({
        reason: '',
        start_date: '',
        end_date: '',
      });
      setFormData({
        email: '',
        password: '',
        role: 'user',
        first_name: '',
        last_name: '',
        address: '',
        postal_code: '',
        phone: '',
      });
    } catch (error) {
      console.error('Fejl ved ban af bruger:', error);
    }
  }
};

// Slet bruger
const handleDeleteUser = async (userId: string) => {
  if (!confirm('Er du sikker på, at du vil slette denne bruger?')) return;

  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    fetchUsers();
  } catch (error) {
    console.error('Fejl ved sletning af bruger:', error);
  }
};

// Ban bruger
const handleBanUser = async () => {
  if (!selectedUser) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_bans')
      .insert({
        user_id: selectedUser.id,
        banned_by: user.id,
        reason: banData.reason,
        start_date: banData.start_date,
        end_date: banData.end_date,
      });

    if (error) throw error;

    setIsBanOpen(false);
    setSelectedUser(null);
    setSelectedUser(user);
    const today = new Date();
    const oneWeek = new Date(today);
    oneWeek.setDate(today.getDate() + 7);
    
    setBanData({
      reason: '',
      start_date: today.toISOString(),
      end_date: oneWeek.toISOString(),
    });
    setIsBanOpen(true);
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1AA49A]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brugeradministration</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1AA49A] text-white hover:bg-[#158C84]">
              <Plus className="w-4 h-4 mr-2" />
              Opret bruger
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? 'Rediger bruger' : 'Opret ny bruger'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!selectedUser}
                />
              </div>
              {!selectedUser && (
                <div>
                  <Label>Adgangskode</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}
              <div>
                <Label>Fornavn</Label>
                <Input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Efternavn</Label>
                <Input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Adresse</Label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <Label>Postnummer</Label>
                <Input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Rolle</Label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">Bruger</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <Button
                className="w-full bg-[#1AA49A] text-white hover:bg-[#158C84]"
                onClick={selectedUser ? handleUpdateUser : handleCreateUser}
              >
                {selectedUser ? 'Opdater' : 'Opret'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Navn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rolle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Oprettet
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Handlinger
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(user.profile.first_name || '') + ' ' + (user.profile.last_name || '')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(user.profile.address || '') + (user.profile.postal_code ? ', ' + user.profile.postal_code : '')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.profile.phone || ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.role === 'admin' ? 'Administrator' : 'Bruger'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.profile.credits ?? 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(user.created_at), 'PPP', { locale: da })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBan(user)}
                  >
                    <Ban className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isBanOpen} onOpenChange={setIsBanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban bruger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Grund</Label>
              <Textarea
                value={banData.reason}
                onChange={(e) => setBanData({ ...banData, reason: e.target.value })}
                placeholder="Indtast grund til ban..."
              />
            </div>
            <div>
              <Label>Start dato</Label>
              <Input
                type="datetime-local"
                value={banData.start_date.slice(0, 16)}
                onChange={(e) => setBanData({ ...banData, start_date: new Date(e.target.value).toISOString() })}
              />
            </div>
            <div>
              <Label>Slut dato</Label>
              <Input
                type="datetime-local"
                value={banData.end_date.slice(0, 16)}
                onChange={(e) => setBanData({ ...banData, end_date: new Date(e.target.value).toISOString() })}
              />
            </div>
            <Button
              className="w-full bg-[#1AA49A] text-white hover:bg-[#158C84]"
              onClick={handleBanUser}
            >
              Ban bruger
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 