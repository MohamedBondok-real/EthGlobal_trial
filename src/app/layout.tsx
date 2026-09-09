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
      <body className="min-h-screen bg-[#08060c] text-white antialiased selection:bg-pink-500 selection:text-white relative overflow-x-hidden">
        {/* Ambient Glowing Orbs in Background */}
        <div className="fixed -top-40 -left-40 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-br from-orange-500/20 to-pink-600/20 blur-[120px] pointer-events-none -z-10" />
        <div className="fixed -bottom-40 -right-40 w-96 h-96 sm:w-[600px] sm:h-[600px] rounded-full bg-gradient-to-tl from-pink-600/20 to-purple-700/20 blur-[130px] pointer-events-none -z-10" />
        <div className="fixed top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-orange-600/10 blur-[140px] pointer-events-none -z-10" />

        {/* Top Radiant Accent Line */}
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 z-50 shadow-[0_0_12px_rgba(236,72,153,0.8)]" />

        <div className="relative min-h-screen flex flex-col justify-between">
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>

          <footer className="w-full border-t border-pink-900/40 bg-[#0d0714]/80 backdrop-blur-md py-4 text-center text-xs text-pink-200/70">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">PrivyShield AI Agent</span>
                <span className="text-pink-300/60">• ETHGlobal 2026 Submission</span>
              </div>
              <div className="text-[11px] text-pink-300/80">
                Powered by <strong className="text-amber-300">Privy Server Wallets</strong> & <strong className="text-pink-400">Policy Engine</strong> (Base Sepolia)
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
