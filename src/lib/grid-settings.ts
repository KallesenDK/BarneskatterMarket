import { createClient } from '@/lib/supabase/client'

export interface GridSettings {
  lg: number
  md: number
  sm: number
}

export const defaultGridSettings: GridSettings = {
  lg: 3,
  md: 2,
  sm: 1
}

export async function getGridSettings(key: 'credit_packages_grid' | 'subscription_packages_grid'): Promise<GridSettings> {
  console.log('Fetching grid settings for key:', key)
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single()

    if (error) {
      console.error('Error fetching grid settings:', error)
      return defaultGridSettings
    }

    console.log('Grid settings data:', data)

    if (!data?.value) {
      console.log('No grid settings found, using defaults')
      return defaultGridSettings
    }

    // Validate the grid settings
    const settings = data.value as GridSettings
    if (!settings.lg || !settings.md || !settings.sm) {
      console.log('Invalid grid settings, using defaults')
      return defaultGridSettings
    }

    return settings
  } catch (error) {
    console.error('Unexpected error fetching grid settings:', error)
    return defaultGridSettings
  }
} 