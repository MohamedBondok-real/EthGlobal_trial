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
      <body className="min-h-screen bg-[#08060B] text-rose-50 antialiased selection:bg-pink-600 selection:text-white">
        <div className="relative min-h-screen flex flex-col justify-between">
          {/* Vibrant Ambient Sunset Gradient Orbs */}
          <div className="fixed top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-orange-600/20 blur-[130px] pointer-events-none -z-10" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[650px] h-[650px] rounded-full bg-pink-600/20 blur-[150px] pointer-events-none -z-10" />
          <div className="fixed top-[35%] right-[25%] w-[450px] h-[450px] rounded-full bg-fuchsia-600/15 blur-[140px] pointer-events-none -z-10" />

          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>

          <footer className="w-full border-t border-pink-900/40 bg-[#0c0612]/70 py-4 text-center text-xs text-pink-300/60">
            Built for ETHGlobal 2026 • Powered by <span className="text-orange-400 font-semibold">Privy Server Wallets</span> & <span className="text-pink-400 font-semibold">Policy Engine</span> • Hardware-Isolated TEE Security
          </footer>
        </div>
      </body>
    </html>
  );
}
