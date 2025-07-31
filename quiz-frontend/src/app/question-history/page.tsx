'use client';

export const dynamic = 'force-dynamic';

import dynamic from 'next/dynamic';

const ClientOnlyPage = dynamic(() => import('./ClientOnlyPage'), { ssr: false });

export default function Page() {
  return <ClientOnlyPage />;
} 