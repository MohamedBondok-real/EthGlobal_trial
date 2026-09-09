'use client';

import React, { useState } from 'react';
import { KeyRound, User, LogOut, Check, Sparkles } from 'lucide-react';

interface PrivyAuthButtonProps {
  onLoginSuccess?: (user: any) => void;
}

export default function PrivyAuthButton({ onLoginSuccess }: PrivyAuthButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSimulatedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setUserEmail(emailInput);
      setIsSubmitting(false);
      setShowModal(false);
      if (onLoginSuccess) {
        onLoginSuccess({ email: emailInput, id: 'privy-user-' + Math.random().toString(36).substring(2, 8) });
      }
    }, 600);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-950/90 to-pink-950/90 border border-pink-500/60 text-xs text-white font-medium shadow-[0_0_15px_rgba(255,0,127,0.3)]">
          <User className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-pink-100">{userEmail}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-xl bg-pink-950/70 hover:bg-pink-900 text-pink-300 hover:text-white border border-pink-600/50 transition-all shadow-md"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF5500] via-[#FF007F] to-[#E11D48] hover:from-[#FF7700] hover:via-[#FF2A85] hover:to-[#F43F5E] text-white font-bold text-xs shadow-[0_0_20px_rgba(255,0,127,0.45)] transition-all hover:scale-[1.04] active:scale-[0.97]"
      >
        <KeyRound className="w-4 h-4 text-amber-200" />
        <span>Privy Social Login</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#14071f] border-2 border-[#FF007F]/60 p-6 shadow-[0_0_50px_rgba(255,0,127,0.4)] relative">
            <div className="flex items-center justify-between pb-4 border-b border-pink-900/60">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5500] to-[#FF007F] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,0,127,0.6)]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white tracking-wide">Privy Embedded Login</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-pink-300 hover:text-white text-sm p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-pink-100/90 my-4 leading-relaxed font-normal">
              Authenticate via Email, Google, or Passkeys to delegate policy-scoped execution permissions to the autonomous AI Agent.
            </p>

            <form onSubmit={handleSimulatedLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-pink-200 mb-1 tracking-wide">
                  Email Address / Web3 ID
                </label>
                <input
                  type="email"
                  required
                  placeholder="builder@ethglobal.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#08020d] border border-pink-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-pink-400/40 focus:outline-none focus:border-[#FF007F] focus:shadow-[0_0_15px_rgba(255,0,127,0.4)] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF5500] via-[#FF007F] to-[#E11D48] hover:from-[#FF7700] hover:to-[#FF2A85] text-white font-black text-xs shadow-[0_0_25px_rgba(255,0,127,0.5)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                {isSubmitting ? 'Authenticating...' : 'Continue with Privy'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-pink-900/60 text-[10px] text-center text-pink-300/80">
              App ID: <span className="font-mono text-amber-300 font-bold">cmtojqa83003h0cjxy26txns2</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
