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
      <body className="min-h-screen bg-[#060309] text-white antialiased selection:bg-pink-500 selection:text-white">
        <div className="relative min-h-screen flex flex-col justify-between">
          {/* Intense, Ultra-Radiant Ambient Light Beams */}
          <div className="fixed top-[-8%] left-[-8%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#FF5500]/30 to-[#FF007F]/25 blur-[120px] pointer-events-none -z-10" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-[#FF007F]/30 to-[#9D00FF]/25 blur-[140px] pointer-events-none -z-10" />
          <div className="fixed top-[30%] right-[20%] w-[500px] h-[500px] rounded-full bg-[#FF7700]/20 blur-[130px] pointer-events-none -z-10" />
          <div className="fixed top-[60%] left-[25%] w-[450px] h-[450px] rounded-full bg-[#E00070]/20 blur-[120px] pointer-events-none -z-10" />

          {/* Top Subtle Radiant Border Beam */}
          <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6500] via-[#FF007F] to-[#A855F7] z-50 shadow-[0_0_15px_rgba(255,0,127,0.8)]" />

          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>

          <footer className="w-full border-t border-pink-500/30 bg-[#0a0410]/90 py-4 text-center text-xs text-pink-200/80 shadow-[0_-5px_20px_rgba(255,0,127,0.15)]">
            Built for ETHGlobal 2026 • Powered by <span className="text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">Privy Server Wallets</span> & <span className="text-pink-400 font-bold drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">Policy Engine</span> • Hardware-Isolated TEE Security
          </footer>
        </div>
      </body>
    </html>
  );
}
