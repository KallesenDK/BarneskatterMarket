import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 pt-[8vh]">
        <div className="container space-y-8 mt-8">
          {children}
        </div>
      </div>
    </div>
  );
} 