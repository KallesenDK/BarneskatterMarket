import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardClient from './DashboardClient';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card'
import { Users, Package2, MessageSquare, ShoppingCart } from 'lucide-react'

// Fallback komponent ved fejl
function AuthError() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Adgang nægtet</h1>
        <p className="text-gray-600 mb-6">
          Din session kunne ikke valideres. Du skal logge ind for at få adgang til dashboard.
        </p>
        <Link 
          href="/auth/signin"
          className="block w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 text-center"
        >
          Gå til login
        </Link>
      </div>
    </div>
  );
}

const stats = [
  {
    title: 'Total Brugere',
    value: '120',
    change: '+12%',
    changeType: 'increase',
    icon: Users
  },
  {
    title: 'Aktive Pakker',
    value: '45',
    change: '+8%',
    changeType: 'increase',
    icon: Package2
  },
  {
    title: 'Nye Beskeder',
    value: '23',
    change: '-5%',
    changeType: 'decrease',
    icon: MessageSquare
  },
  {
    title: 'Ordrer i Dag',
    value: '8',
    change: '+20%',
    changeType: 'increase',
    icon: ShoppingCart
  }
]

const recentOrders = [
  {
    kunde: 'Anders Hansen',
    beløb: 'kr 2.999',
    status: 'Betalt',
    dato: '10 min siden'
  },
  {
    kunde: 'Marie Jensen',
    beløb: 'kr 1.499',
    status: 'Afventer',
    dato: '2 timer siden'
  },
  {
    kunde: 'Peter Nielsen',
    beløb: 'kr 4.999',
    status: 'Betalt',
    dato: '3 timer siden'
  }
]

"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";
import AuthError from "../components/AuthError";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        // Tjek om vi kommer fra login-siden med auth-parameter
        const authParam = searchParams.get("auth");
        // Tjek session
        const { data, error } = await supabase.auth.getSession();
        if (!data.session) {
          router.replace("/dashboard/main/auth-error");
          return;
        }
        const isAdmin = data.session.user.email === "kenneth@sigmatic.dk";
        if (isAdmin) {
          router.replace("/dashboard/admin");
        } else {
          router.replace("/dashboard/user");
        }
      } catch (error) {
        router.replace("/dashboard/main/auth-error");
      }
    };
    checkSessionAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

