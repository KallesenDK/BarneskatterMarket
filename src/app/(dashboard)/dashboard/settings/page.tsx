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
  stripeSecretKey?: string;
  stripePublishableKey?: string;
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
          const stripeSecretKey = data.find(s => s.key === 'stripe_secret_key')?.value || '';
          const stripePublishableKey = data.find(s => s.key === 'stripe_publishable_key')?.value || '';
          setSettings({
            creditPackagesGrid,
            subscriptionPackagesGrid,
            stripeSecretKey,
            stripePublishableKey
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

  const [stripeKeyInput, setStripeKeyInput] = useState(settings.stripeSecretKey || '');
  const [savingStripeKey, setSavingStripeKey] = useState(false);
  const [stripePublishableKeyInput, setStripePublishableKeyInput] = useState(settings.stripePublishableKey || '');
  const [savingStripePublishableKey, setSavingStripePublishableKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showPublishable, setShowPublishable] = useState(false);

  const saveStripeKey = async () => {
    setSavingStripeKey(true);
    try {
      const adminCheck = await fetch('/api/check-admin');
      const { isAdmin, error } = await adminCheck.json();
      if (!adminCheck.ok || error || !isAdmin) {
        toast({
          variant: "destructive",
          title: "Fejl",
          description: error || 'Du har ikke administrator rettigheder'
        });
        setSavingStripeKey(false);
        return;
      }
      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert({
          key: 'stripe_secret_key',
          value: stripeKeyInput,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key', ignoreDuplicates: false });
      if (updateError) throw updateError;
      setSettings(prev => ({ ...prev, stripeSecretKey: stripeKeyInput }));
      toast({ title: "Success", description: "Stripe Secret Key gemt", className: "bg-green-500 text-white" });
    } catch (error) {
      toast({ variant: "destructive", title: "Fejl", description: error instanceof Error ? error.message : 'Kunne ikke gemme Stripe Secret Key' });
    } finally {
      setSavingStripeKey(false);
    }
  };

  const saveStripePublishableKey = async () => {
    setSavingStripePublishableKey(true);
    try {
      const adminCheck = await fetch('/api/check-admin');
      const { isAdmin, error } = await adminCheck.json();
      if (!adminCheck.ok || error || !isAdmin) {
        toast({
          variant: "destructive",
          title: "Fejl",
          description: error || 'Du har ikke administrator rettigheder'
        });
        setSavingStripePublishableKey(false);
        return;
      }
      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert({
          key: 'stripe_publishable_key',
          value: stripePublishableKeyInput,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key', ignoreDuplicates: false });
      if (updateError) throw updateError;
      setSettings(prev => ({ ...prev, stripePublishableKey: stripePublishableKeyInput }));
      toast({ title: "Success", description: "Stripe Publishable Key gemt", className: "bg-green-500 text-white" });
    } catch (error) {
      toast({ variant: "destructive", title: "Fejl", description: error instanceof Error ? error.message : 'Kunne ikke gemme Stripe Publishable Key' });
    } finally {
      setSavingStripePublishableKey(false);
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
          {/* Stripe API Keys Sektion */}
          <Card>
            <CardHeader>
              <CardTitle>Stripe API Keys</CardTitle>
              <CardDescription>
                Indtast både din Stripe Secret Key og Publishable Key for at aktivere betalinger på platformen.<br />
                <span className="text-xs text-gray-400">(Gemmes sikkert i databasen)</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="stripe-publishable-key">Stripe Publishable Key</Label>
                <div className="flex gap-2">
                  <input
                    id="stripe-publishable-key"
                    type={showPublishable ? "text" : "password"}
                    value={stripePublishableKeyInput}
                    onChange={e => setStripePublishableKeyInput(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="pk_live_..."
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPublishable(v => !v)}
                    className="px-3 py-2 border rounded text-xs"
                  >
                    {showPublishable ? "Skjul" : "Vis"}
                  </button>
                </div>
                <button
                  onClick={saveStripePublishableKey}
                  disabled={savingStripePublishableKey}
                  className="bg-primary text-white rounded px-4 py-2 mt-2 disabled:opacity-50"
                >
                  Gem Publishable Key
                </button>
                {settings.stripePublishableKey && <div className="text-xs text-green-600">Publishable Key er gemt</div>}
              </div>
              <div>
                <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                <div className="flex gap-2">
                  <input
                    id="stripe-key"
                    type={showSecret ? "text" : "password"}
                    value={stripeKeyInput}
                    onChange={e => setStripeKeyInput(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="sk_live_..."
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(v => !v)}
                    className="px-3 py-2 border rounded text-xs"
                  >
                    {showSecret ? "Skjul" : "Vis"}
                  </button>
                </div>
                <button
                  onClick={saveStripeKey}
                  disabled={savingStripeKey}
                  className="bg-primary text-white rounded px-4 py-2 mt-2 disabled:opacity-50"
                >
                  Gem Secret Key
                </button>
                {settings.stripeSecretKey && <div className="text-xs text-green-600">Secret Key er gemt</div>}
              </div>
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