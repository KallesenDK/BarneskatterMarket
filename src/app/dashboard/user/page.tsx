import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';

export default async function UserDashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  return <DashboardClient initialSession={session} />;
} 