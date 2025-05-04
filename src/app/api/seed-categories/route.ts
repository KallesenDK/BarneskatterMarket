export const dynamic = "force-dynamic";

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Først opret tabellerne hvis de ikke findes
    await supabase.rpc('create_categories_tables')

    // Hovedkategorier
    const categories = [
      { id: '1', name: 'Elektronik' },
      { id: '2', name: 'Møbler' },
      { id: '3', name: 'Tøj og mode' },
      { id: '4', name: 'Sport og fritid' },
      { id: '5', name: 'Hjem og have' },
      { id: '6', name: 'Biler og bådudstyr' },
      { id: '7', name: 'Børn og baby' },
      { id: '8', name: 'Samlerartikler' },
      { id: '9', name: 'Spil og legetøj' },
      { id: '10', name: 'Bøger og medier' },
      { id: '11', name: 'Skønhed og velvære' },
      { id: '12', name: 'Håndlavede produkter' },
      { id: '13', name: 'Værktøj og maskiner' },
      { id: '14', name: 'Instrumenter' },
      { id: '15', name: 'Kunst og dekoration' }
    ]

    // Indsæt alle kategorier
    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'id' })

    if (categoriesError) {
      throw categoriesError
    }

    // Underkategorier for Elektronik
    const electronicsSubcategories = [
      { id: '101', category_id: '1', name: 'Mobiltelefoner' },
      { id: '102', category_id: '1', name: 'Computere' },
      { id: '103', category_id: '1', name: 'TV og lyd' },
      { id: '104', category_id: '1', name: 'Foto og video' },
      { id: '105', category_id: '1', name: 'Gaming' }
    ]

    // Underkategorier for Møbler
    const furnitureSubcategories = [
      { id: '201', category_id: '2', name: 'Sofaer og lænestole' },
      { id: '202', category_id: '2', name: 'Borde' },
      { id: '203', category_id: '2', name: 'Senge og madrasser' },
      { id: '204', category_id: '2', name: 'Opbevaring' },
      { id: '205', category_id: '2', name: 'Kontor' }
    ]

    // Underkategorier for Tøj og mode
    const clothingSubcategories = [
      { id: '301', category_id: '3', name: 'Herretøj' },
      { id: '302', category_id: '3', name: 'Dametøj' },
      { id: '303', category_id: '3', name: 'Sko' },
      { id: '304', category_id: '3', name: 'Tasker og accessories' },
      { id: '305', category_id: '3', name: 'Ure og smykker' }
    ]

    // Saml alle underkategorier
    const allSubcategories = [
      ...electronicsSubcategories,
      ...furnitureSubcategories,
      ...clothingSubcategories
    ]

    // Indsæt alle underkategorier
    const { error: subcategoriesError } = await supabase
      .from('subcategories')
      .upsert(allSubcategories, { onConflict: 'id' })

    if (subcategoriesError) {
      throw subcategoriesError
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Kategorier og underkategorier oprettet med succes' 
    })
  } catch (error) {
    console.error('Fejl ved oprettelse af kategorier:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Der opstod en fejl ved oprettelse af kategorier' 
    }, { status: 500 })
  }
} 