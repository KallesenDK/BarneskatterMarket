'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { Plus, Pencil, Trash2, Ban, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  postal_code: string;
  phone: string;
  banned_until: string | null;
  credits: number;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  subscription_end_date: string | null;
  role: string;
  is_admin: boolean;
  active_ban?: UserBan;
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

export default function UsersPage() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/signin';
        return;
      }

      // Hent brugerens rolle fra profiles tabellen
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Fejl ved hentning af brugerrolle:', error);
        window.location.href = '/dashboard';
        return;
      }

      const isAdminUser = userProfile?.role === 'admin';
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

  const fetchUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Henter brugere...');
      
      // Hent profiler først
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) {
        console.error('Fejl ved hentning af profiler:', profileError);
        throw profileError;
      }

      // Hent aktive bans
      const now = new Date().toISOString();
      const { data: activeBans, error: bansError } = await supabase
        .from('user_bans')
        .select('*')
        .gte('end_date', now)
        .lte('start_date', now);

      if (bansError) {
        console.error('Fejl ved hentning af bans:', bansError);
        throw bansError;
      }

      // Transformer data
      const transformedUsers = profiles.map(profile => {
        const now = new Date();
        // Tjek om brugeren har en aktiv ban baseret på banned_until
        const isCurrentlyBanned = profile.banned_until && new Date(profile.banned_until) > now;
        
        // Find aktiv ban fra user_bans tabellen
        const activeBan = activeBans?.find(ban => 
          ban.user_id === profile.id && 
          new Date(ban.end_date) > now && 
          new Date(ban.start_date) <= now
        );
        
        return {
          id: profile.id,
          first_name: profile.first_name || 'Unavngivet',
          last_name: profile.last_name || 'Bruger',
          address: profile.address || '',
          postal_code: profile.postal_code || '',
          phone: profile.phone || '',
          banned_until: isCurrentlyBanned ? profile.banned_until : null,
          credits: profile.credits || 0,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          avatar_url: profile.avatar_url,
          subscription_end_date: profile.subscription_end_date,
          role: profile.role || 'user',
          is_admin: profile.is_admin || false,
          active_ban: activeBan || null
        };
      });

      console.log('Transformerede brugere:', transformedUsers);
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Fejl ved hentning af brugere:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validér at vi har de nødvendige data
      if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
        throw new Error('Alle påkrævede felter skal udfyldes');
      }

      // Tjek om den aktuelle bruger er admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Ikke logget ind');

      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!currentUserProfile || currentUserProfile.role !== 'admin') {
        throw new Error('Du har ikke rettigheder til at oprette brugere');
      }

      console.log('Opretter bruger med data:', {
        ...formData,
        is_admin: formData.role === 'admin'
      });

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          is_admin: formData.role === 'admin'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Der skete en fejl ved oprettelse af brugeren');
      }

      // Opdater bruger liste og nulstil form
      await fetchUsers();
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

      // Vis bekræftelse
      toast({
        title: "Bruger oprettet",
        description: `${formData.first_name} ${formData.last_name} er blevet oprettet som ${formData.role === 'admin' ? 'administrator' : 'bruger'}.`,
        variant: "default",
        className: "bg-green-500 text-white border-green-600"
      });
    } catch (error) {
      console.error('Fejl ved oprettelse af bruger:', error);
      toast({
        variant: "destructive",
        title: "Fejl ved oprettelse",
        description: error instanceof Error ? error.message : "Der skete en fejl ved oprettelse af brugeren"
      });
    }
  };

  const handleToggleAdmin = async (user: any) => {
    try {
      const newIsAdmin = !user.is_admin;
      const newRole = newIsAdmin ? 'admin' : 'user';

      const response = await fetch('/api/users/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          role: newRole,
          is_admin: newIsAdmin
        }),
      });

      const responseData = await response.json();
      console.log('API response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Der skete en fejl ved opdatering af brugerrolle');
      }

      await fetchUsers();
      toast({
        title: "Bruger opdateret",
        description: `${user.first_name} ${user.last_name} er nu ${newIsAdmin ? 'administrator' : 'almindelig bruger'}.`,
        variant: "default",
        className: "bg-green-500 text-white border-green-600"
      });
    } catch (error) {
      console.error('Fejl ved opdatering af bruger:', error);
      toast({
        variant: "destructive",
        title: "Fejl ved opdatering",
        description: error instanceof Error ? error.message : "Der skete en fejl. Prøv igen eller kontakt support hvis problemet fortsætter."
      });
    }
  };

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

  const handleBanUser = async () => {
    if (!selectedUser) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Indsæt i user_bans tabellen
      const { error: banError } = await supabase
        .from('user_bans')
        .insert({
          user_id: selectedUser.id,
          banned_by: user.id,
          reason: banData.reason,
          start_date: banData.start_date,
          end_date: banData.end_date
        });

      if (banError) throw banError;

      // Opdater profiles tabellen
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          banned_until: banData.end_date
        })
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      fetchUsers();
      setIsBanOpen(false);
      setSelectedUser(null);
      setBanData({
        reason: '',
        start_date: '',
        end_date: ''
      });

      toast({
        title: "Bruger udelukket",
        description: `${selectedUser.first_name} ${selectedUser.last_name} er blevet udelukket.`,
        variant: "default",
        className: "bg-yellow-500 text-white border-yellow-600"
      });
    } catch (error) {
      console.error('Fejl ved udelukkelse af bruger:', error);
      toast({
        variant: "destructive",
        title: "Fejl ved udelukkelse",
        description: error instanceof Error ? error.message : "Der skete en fejl ved udelukkelse af brugeren"
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      // Opdater basis information
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          address: formData.address,
          postal_code: formData.postal_code,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (updateError) {
        throw updateError;
      }

      await fetchUsers();
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

      toast({
        title: "Bruger opdateret",
        description: `${formData.first_name} ${formData.last_name} er blevet opdateret.`,
        variant: "default",
        className: "bg-green-500 text-white border-green-600"
      });
    } catch (error) {
      console.error('Fejl ved opdatering af bruger:', error);
      toast({
        variant: "destructive",
        title: "Fejl ved opdatering",
        description: error instanceof Error ? error.message : "Der skete en fejl. Prøv igen eller kontakt support hvis problemet fortsætter."
      });
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: '',
      password: '',
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      address: user.address,
      postal_code: user.postal_code,
      phone: user.phone,
    });
    setIsOpen(true);
  };

  const handleBan = (user: User) => {
    setSelectedUser(user);
    const now = new Date().toISOString();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    
    setBanData({
      reason: '',
      start_date: now,
      end_date: oneWeekFromNow.toISOString()
    });
    setIsBanOpen(true);
  };

  const handleRemoveBan = async (userId: string) => {
    if (!confirm('Er du sikker på, at du vil fjerne denne udelukkelse?')) return;

    try {
      // Opdater profiles tabellen
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          banned_until: null
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Fejl ved opdatering af profil:', profileError);
        throw profileError;
      }

      // Find den aktive ban
      const now = new Date().toISOString();
      const { data: activeBans, error: findError } = await supabase
        .from('user_bans')
        .select('*')
        .eq('user_id', userId)
        .gte('end_date', now);

      if (findError) {
        console.error('Fejl ved søgning efter aktiv ban:', findError);
        throw findError;
      }

      // Hvis der er en aktiv ban, opdater end_date til nu
      if (activeBans && activeBans.length > 0) {
        const { error: banError } = await supabase
          .from('user_bans')
          .update({
            end_date: now
          })
          .eq('id', activeBans[0].id);

        if (banError) {
          console.error('Fejl ved opdatering af ban:', banError);
          throw banError;
        }
      }

      // Genindlæs brugerlisten
      await fetchUsers();
      
      alert('Udelukkelsen er blevet fjernet');
    } catch (error) {
      console.error('Fejl ved fjernelse af udelukkelse:', error);
      alert('Der skete en fejl ved fjernelse af udelukkelsen');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1AA49A]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Ingen adgang</h1>
        <p className="mt-2 text-gray-600">Du har ikke adgang til denne side.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1AA49A]">Brugere</h1>
          <p className="mt-1 text-sm text-gray-500">Administrer systemets brugere</p>
        </div>
        
        <Button onClick={() => {
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
          setIsOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Opret Bruger
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NAVN</TableHead>
              <TableHead>ROLLE</TableHead>
              <TableHead>OPRETTET</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>BAN STATUS</TableHead>
              <TableHead>HANDLINGER</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{format(new Date(user.created_at), 'd. MMMM yyyy', { locale: da })}</TableCell>
                <TableCell>
                  {user.banned_until ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="default">Aktiv</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.banned_until ? format(new Date(user.banned_until), 'd. MMMM yyyy', { locale: da }) : 'Ikke banned'}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEdit(user)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleToggleAdmin(user)}
                    title={user.is_admin ? "Fjern admin rettigheder" : "Gør til administrator"}
                  >
                    {user.is_admin ? (
                      <UserMinus className="h-4 w-4 text-red-500" />
                    ) : (
                      <UserPlus className="h-4 w-4 text-green-500" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleBan(user)}
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Rediger bruger' : 'Opret ny bruger'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser 
                ? 'Rediger brugerens information nedenfor. Alle felter markeret med * skal udfyldes.'
                : 'Udfyld formularen nedenfor for at oprette en ny bruger. Alle felter markeret med * skal udfyldes.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            selectedUser ? handleUpdateUser() : handleCreateUser();
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!!selectedUser}
                  required
                  autoComplete="email"
                />
              </div>
              {!selectedUser && (
                <div className="col-span-2">
                  <Label htmlFor="password">Adgangskode *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="first_name">Fornavn *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Efternavn *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                  autoComplete="family-name"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  autoComplete="street-address"
                />
              </div>
              <div>
                <Label htmlFor="postal_code">Postnummer</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  autoComplete="postal-code"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  autoComplete="tel"
                />
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
                {selectedUser ? 'Gem ændringer' : 'Opret bruger'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isBanOpen} onOpenChange={setIsBanOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Udeluk bruger
              {selectedUser && ` - ${selectedUser.first_name} ${selectedUser.last_name}`}
            </DialogTitle>
            <DialogDescription>
              Angiv årsag og tidsperiode for udelukkelsen. Alle felter skal udfyldes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleBanUser();
          }} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Begrundelse</Label>
                <Textarea
                  id="reason"
                  value={banData.reason}
                  onChange={(e) => setBanData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Indtast begrundelse for udelukkelse..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="start_date">Start dato</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={banData.start_date.slice(0, 16)}
                  onChange={(e) => {
                    const newStartDate = new Date(e.target.value).toISOString();
                    setBanData(prev => ({ 
                      ...prev, 
                      start_date: newStartDate,
                      // Hvis slutdatoen er før den nye startdato, sæt slutdatoen til 7 dage efter startdatoen
                      end_date: new Date(prev.end_date) < new Date(newStartDate) 
                        ? new Date(new Date(newStartDate).setDate(new Date(newStartDate).getDate() + 7)).toISOString()
                        : prev.end_date
                    }));
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">Slut dato</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={banData.end_date.slice(0, 16)}
                  onChange={(e) => setBanData(prev => ({ ...prev, end_date: new Date(e.target.value).toISOString() }))}
                  min={banData.start_date.slice(0, 16)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsBanOpen(false);
                  setBanData({
                    reason: '',
                    start_date: '',
                    end_date: ''
                  });
                }}
              >
                Annuller
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={!banData.reason || !banData.start_date || !banData.end_date || 
                         new Date(banData.end_date) <= new Date(banData.start_date)}
              >
                Udeluk bruger
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 