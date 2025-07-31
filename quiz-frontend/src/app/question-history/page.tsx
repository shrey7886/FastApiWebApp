'use client';

export const dynamic = 'force-dynamic';

import dynamicImport from 'next/dynamic';

const ClientOnlyPage = dynamicImport(() => import('./ClientOnlyPage'), { ssr: false });

export default function Page() {
  return <ClientOnlyPage />;
} 