'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GridSettings {
  sm: number;
  md: number;
  lg: number;
}

interface Settings {
  creditPackagesGrid: GridSettings;
  subscriptionPackagesGrid: GridSettings;
}

export default function AdminSettingsPage() {
  const { supabase } = useSupabase();
  const [settings, setSettings] = useState<Settings>({
    creditPackagesGrid: { sm: 2, md: 3, lg: 4 },
    subscriptionPackagesGrid: { sm: 2, md: 3, lg: 4 }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['credit_packages_grid', 'subscription_packages_grid']);

        if (error) throw error;

        const newSettings = { ...settings };
        data?.forEach(item => {
          if (item.key === 'credit_packages_grid') {
            newSettings.creditPackagesGrid = item.value;
          } else if (item.key === 'subscription_packages_grid') {
            newSettings.subscriptionPackagesGrid = item.value;
          }
        });
        setSettings(newSettings);
      } catch (error) {
        console.error('Fejl ved hentning af indstillinger:', error);
        toast.error('Kunne ikke hente indstillinger');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Opdater kredit pakke grid
      const { error: error1 } = await supabase
        .from('site_settings')
        .upsert({
          key: 'credit_packages_grid',
          value: settings.creditPackagesGrid,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error1) throw error1;

      // Opdater abonnements pakke grid
      const { error: error2 } = await supabase
        .from('site_settings')
        .upsert({
          key: 'subscription_packages_grid',
          value: settings.subscriptionPackagesGrid,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error2) throw error2;

      toast.success('Indstillinger gemt');
    } catch (error) {
      console.error('Fejl ved gem af indstillinger:', error);
      toast.error('Kunne ikke gemme indstillinger');
    } finally {
      setSaving(false);
    }
  };

  const handleGridChange = (
    type: 'creditPackagesGrid' | 'subscriptionPackagesGrid',
    size: 'sm' | 'md' | 'lg',
    value: string
  ) => {
    const numValue = parseInt(value) || 1;
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [size]: Math.min(Math.max(numValue, 1), 6) // Begræns til mellem 1 og 6 kolonner
      }
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Indstillinger</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Grid Layout Indstillinger</CardTitle>
          <CardDescription>
            Konfigurer hvordan pakker og produktpladser vises på forskellige skærmstørrelser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Kredit Pakker Grid */}
          <div className="space-y-4">
            <h3 className="font-semibold">Kredit Pakker Layout</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Små skærme (sm)</Label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  value={settings.creditPackagesGrid.sm}
                  onChange={(e) => handleGridChange('creditPackagesGrid', 'sm', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Medium skærme (md)</Label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  value={settings.creditPackagesGrid.md}
                  onChange={(e) => handleGridChange('creditPackagesGrid', 'md', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Store skærme (lg)</Label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  value={settings.creditPackagesGrid.lg}
                  onChange={(e) => handleGridChange('creditPackagesGrid', 'lg', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Abonnements Pakker Grid */}
          <div className="space-y-4">
            <h3 className="font-semibold">Abonnements Pakker Layout</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Små skærme (sm)</Label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  value={settings.subscriptionPackagesGrid.sm}
                  onChange={(e) => handleGridChange('subscriptionPackagesGrid', 'sm', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Medium skærme (md)</Label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  value={settings.subscriptionPackagesGrid.md}
                  onChange={(e) => handleGridChange('subscriptionPackagesGrid', 'md', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Store skærme (lg)</Label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  value={settings.subscriptionPackagesGrid.lg}
                  onChange={(e) => handleGridChange('subscriptionPackagesGrid', 'lg', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving ? 'Gemmer...' : 'Gem indstillinger'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 