// Client layout to keep SPA state (theme/language/uploaded file) across pages
"use client";

import { AppLayout } from "@/components/AppLayout";

export default function SpaSectionLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

