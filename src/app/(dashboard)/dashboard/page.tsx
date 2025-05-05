"use client";
import { Suspense } from "react";
import DashboardRedirect from "./DashboardRedirect";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardRedirect />
    </Suspense>
  );
}
