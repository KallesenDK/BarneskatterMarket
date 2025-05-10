'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface GridSettings {
  lg: number;
  md: number;
  sm: number;
}

interface SiteSettings {
  creditPackagesGrid: GridSettings;
  subscriptionPackagesGrid: GridSettings;
  thankYouContent?: string;
  adminOrderEmails?: string;
}

export default function SettingsPage() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>({
    creditPackagesGrid: { lg: 3, md: 2, sm: 1 },
    subscriptionPackagesGrid: { lg: 3, md: 2, sm: 1 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*');

        if (error) throw error;
        
        if (data) {
          const creditPackagesGrid = data.find(s => s.key === 'credit_packages_grid')?.value || { lg: 3, md: 2, sm: 1 };
          const subscriptionPackagesGrid = data.find(s => s.key === 'subscription_packages_grid')?.value || { lg: 3, md: 2, sm: 1 };
          const thankYouContent = data.find(s => s.key === 'thank_you_content')?.value || '';
          const adminOrderEmails = data.find(s => s.key === 'admin_order_emails')?.value || '';
          setSettings({
            creditPackagesGrid,
            subscriptionPackagesGrid,
            thankYouContent,
            adminOrderEmails
          });
        }
      } catch (error) {
        console.error('Fejl ved indlæsning af indstillinger:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [supabase]);


  const [thankYouContent, setThankYouContent] = useState(settings.thankYouContent || '');
  const [savingThankYou, setSavingThankYou] = useState(false);
  const [adminOrderEmails, setAdminOrderEmails] = useState(settings.adminOrderEmails || '');
  const [savingAdminOrderEmails, setSavingAdminOrderEmails] = useState(false);



  const saveAdminOrderEmails = async () => {
    setSavingAdminOrderEmails(true);
    try {
      const adminCheck = await fetch('/api/check-admin');
      const { isAdmin, error } = await adminCheck.json();
      if (!adminCheck.ok || error || !isAdmin) {
        toast({
          variant: "destructive",
          title: "Fejl",
          description: error || 'Du har ikke administrator rettigheder'
        });
        setSavingAdminOrderEmails(false);
        return;
      }
      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert({
          key: 'admin_order_emails',
          value: adminOrderEmails,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key', ignoreDuplicates: false });
      if (updateError) throw updateError;
      setSettings(prev => ({ ...prev, adminOrderEmails }));
      toast({ title: "Success", description: "Admin emails gemt", className: "bg-green-500 text-white" });
    } catch (error) {
      toast({ variant: "destructive", title: "Fejl", description: error instanceof Error ? error.message : 'Kunne ikke gemme admin emails' });
    } finally {
      setSavingAdminOrderEmails(false);
    }
  };

  const saveThankYouContent = async () => {
    setSavingThankYou(true);
    try {
      const adminCheck = await fetch('/api/check-admin');
      const { isAdmin, error } = await adminCheck.json();
      if (!adminCheck.ok || error || !isAdmin) {
        toast({
          variant: "destructive",
          title: "Fejl",
          description: error || 'Du har ikke administrator rettigheder'
        });
        setSavingThankYou(false);
        return;
      }
      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert({
          key: 'thank_you_content',
          value: thankYouContent,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key', ignoreDuplicates: false });
      if (updateError) throw updateError;
      setSettings(prev => ({ ...prev, thankYouContent }));
      toast({ title: "Success", description: "Thank You-side opdateret", className: "bg-green-500 text-white" });
    } catch (error) {
      toast({ variant: "destructive", title: "Fejl", description: error instanceof Error ? error.message : 'Kunne ikke gemme Thank You-side' });
    } finally {
      setSavingThankYou(false);
    }
  };




  const saveGridSettings = async (key: string, newValue: GridSettings) => {
    try {
      // Tjek admin rettigheder via API route
      const adminCheck = await fetch('/api/check-admin');
      const { isAdmin, error } = await adminCheck.json();

      if (!adminCheck.ok || error) {
        toast({
          variant: "destructive",
          title: "Fejl",
          description: error || 'Kunne ikke bekræfte admin rettigheder'
        });
        return;
      }

      if (!isAdmin) {
        toast({
          variant: "destructive",
          title: "Ingen adgang",
          description: "Du har ikke administrator rettigheder"
        });
        return;
      }

      // Opdater indstillingerne med upsert
      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert(
          {
            key,
            value: newValue,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'key',
            ignoreDuplicates: false
          }
        );

      if (updateError) {
        console.error('Fejl ved opdatering af indstillinger:', updateError);
        toast({
          variant: "destructive",
          title: "Fejl",
          description: "Kunne ikke gemme indstillingerne"
        });
        return;
      }

      // Opdater lokalt state
      setSettings(prev => ({
        ...prev,
        [key === 'credit_packages_grid' ? 'creditPackagesGrid' : 'subscriptionPackagesGrid']: newValue
      }));

      // Revalider de relevante sider
      if (key === 'credit_packages_grid') {
        await fetch('/product-slots', { 
          method: 'GET', 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
      } else if (key === 'subscription_packages_grid') {
        await fetch('/packages', { 
          method: 'GET', 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
      }

      // Vis success toast
      toast({
        title: "Success",
        description: "Indstillingerne blev gemt",
        className: "bg-green-500 text-white"
      });

    } catch (error) {
      console.error('Fejl ved gem af indstillinger:', error);
      toast({
        variant: "destructive",
        title: "Fejl",
        description: error instanceof Error ? error.message : 'Der opstod en fejl ved gem af indstillinger'
      });
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
    <>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Indstillinger</h1>
          <p className="mt-1 text-sm text-gray-500">Tilpas din oplevelse på platformen</p>
        </div>

        <div className="space-y-6">
          {/* Admin emails for ordre */}
          <Card>
            <CardHeader>
              <CardTitle>Admin emails for ordrer</CardTitle>
              <CardDescription>
                Indtast de emails (kommasepareret) som skal modtage besked når der laves en reservation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="admin-order-emails">Emails</Label>
              <input
                id="admin-order-emails"
                type="text"
                value={adminOrderEmails}
                onChange={e => setAdminOrderEmails(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="admin1@email.dk,admin2@email.dk"
                autoComplete="off"
              />
              <button
                onClick={saveAdminOrderEmails}
                disabled={savingAdminOrderEmails}
                className="bg-primary text-white rounded px-4 py-2 disabled:opacity-50"
              >
                Gem emails
              </button>
              {settings.adminOrderEmails && <div className="text-xs text-green-600">Emails er gemt</div>}
            </CardContent>
          </Card>

          {/* Thank You-side tekst */}
          <Card>
            <CardHeader>
              <CardTitle>Thank You-side</CardTitle>
              <CardDescription>
                Redigér teksten som vises for kunden efter gennemført ordre.<br />
                Du kan bruge HTML eller Markdown.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="thankyou-content">Indhold</Label>
              <textarea
                id="thankyou-content"
                value={thankYouContent}
                onChange={e => setThankYouContent(e.target.value)}
                className="w-full border rounded px-3 py-2 min-h-[120px]"
                placeholder="Tak for din ordre! Vi har modtaget din bestilling..."
              />
              <button
                onClick={saveThankYouContent}
                disabled={savingThankYou}
                className="bg-primary text-white rounded px-4 py-2 disabled:opacity-50"
              >
                Gem Thank You-tekst
              </button>
              {settings.thankYouContent && <div className="text-xs text-green-600">Thank You-tekst er gemt</div>}
            </CardContent>
          </Card>


          {/* Layout Indstillinger */}
          <Card>
            <CardHeader>
              <CardTitle>Layout Indstillinger</CardTitle>
              <CardDescription>
                Tilpas hvordan indhold vises på din side
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Kredit Pakker Grid */}
              <div className="space-y-4">
                <h3 className="font-medium">Kredit Pakker Visning</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Desktop (lg)</Label>
                    <Select
                      value={settings.creditPackagesGrid.lg.toString()}
                      onValueChange={(value) => saveGridSettings('credit_packages_grid', {
                        ...settings.creditPackagesGrid,
                        lg: parseInt(value)
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg antal" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,6].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} kort</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tablet (md)</Label>
                    <Select
                      value={settings.creditPackagesGrid.md.toString()}
                      onValueChange={(value) => saveGridSettings('credit_packages_grid', {
                        ...settings.creditPackagesGrid,
                        md: parseInt(value)
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg antal" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} kort</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mobil (sm)</Label>
                    <Select
                      value={settings.creditPackagesGrid.sm.toString()}
                      onValueChange={(value) => saveGridSettings('credit_packages_grid', {
                        ...settings.creditPackagesGrid,
                        sm: parseInt(value)
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg antal" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} kort</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Abonnements Pakker Grid */}
              <div className="space-y-4">
                <h3 className="font-medium">Abonnements Pakker Visning</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Desktop (lg)</Label>
                    <Select
                      value={settings.subscriptionPackagesGrid.lg.toString()}
                      onValueChange={(value) => saveGridSettings('subscription_packages_grid', {
                        ...settings.subscriptionPackagesGrid,
                        lg: parseInt(value)
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg antal" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,6].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} kort</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tablet (md)</Label>
                    <Select
                      value={settings.subscriptionPackagesGrid.md.toString()}
                      onValueChange={(value) => saveGridSettings('subscription_packages_grid', {
                        ...settings.subscriptionPackagesGrid,
                        md: parseInt(value)
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg antal" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} kort</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mobil (sm)</Label>
                    <Select
                      value={settings.subscriptionPackagesGrid.sm.toString()}
                      onValueChange={(value) => saveGridSettings('subscription_packages_grid', {
                        ...settings.subscriptionPackagesGrid,
                        sm: parseInt(value)
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg antal" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} kort</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plads til flere indstillingssektioner */}
          <Card>
            <CardHeader>
              <CardTitle>Notifikationer</CardTitle>
              <CardDescription>
                Kommer snart - Administrer dine notifikationsindstillinger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-gray-500">
                Denne funktion er under udvikling
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privatliv & Sikkerhed</CardTitle>
              <CardDescription>
                Kommer snart - Administrer dine privatlivs- og sikkerhedsindstillinger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-gray-500">
                Denne funktion er under udvikling
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </>
  );
} 