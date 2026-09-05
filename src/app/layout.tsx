import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PrivyShield AI | Autonomous DeFi Agent Wallet with Policy Guardrails',
  description: 'ETHGlobal 2026 Submission: Autonomous AI Agent Wallet powered by Privy Server Wallets and Policy Engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <body className="min-h-screen bg-[#070B14] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <div className="relative min-h-screen flex flex-col justify-between">
          {/* Ambient Background Gradient Orbs */}
          <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none -z-10" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none -z-10" />
          <div className="fixed top-[40%] right-[30%] w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[130px] pointer-events-none -z-10" />

          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>

          <footer className="w-full border-t border-slate-800/60 bg-slate-950/40 py-4 text-center text-xs text-slate-500">
            Built for ETHGlobal 2026 • Powered by <span className="text-indigo-400 font-semibold">Privy Server Wallets & Policy Engine</span> • Hardware-Isolated TEE Security
          </footer>
        </div>
      </body>
    </html>
  );
}
