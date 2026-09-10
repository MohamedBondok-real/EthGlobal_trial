'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?mode=register');
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Redirecting to Registration...</p>
      </div>
    </div>
  );
}
