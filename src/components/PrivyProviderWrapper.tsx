'use client';

import React, { ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmtojqa83003h0cjxy26txns2';

export default function PrivyProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet', 'google', 'github'],
        appearance: {
          theme: 'dark',
          accentColor: '#6366F1',
          logo: 'https://privy.io/images/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
