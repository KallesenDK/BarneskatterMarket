'use client';
export const dynamic = "force-dynamic";
import DashboardClientProvider from './DashboardClientProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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