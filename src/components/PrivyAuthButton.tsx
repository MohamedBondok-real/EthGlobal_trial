'use client';

import React, { useState } from 'react';
import { KeyRound, User, LogOut, Sparkles } from 'lucide-react';

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
      <div className="flex items-center gap-2 max-w-full">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-950/80 to-pink-950/80 border border-pink-500/40 text-xs text-white shadow-sm min-w-0 max-w-[180px] sm:max-w-[220px]">
          <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-mono text-pink-100 truncate">{userEmail}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-pink-950/70 hover:bg-pink-900 text-pink-300 hover:text-white border border-pink-700/40 transition-all shrink-0"
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
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-rose-600 hover:from-orange-600 hover:via-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
      >
        <KeyRound className="w-4 h-4 text-amber-200 shrink-0" />
        <span>Privy Social Login</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#140a1e] border border-pink-500/40 p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-pink-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center text-white shadow-md shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Privy Embedded Login</h3>
                  <p className="text-[11px] text-pink-300/80">Self-Custodial Consumer Auth</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-pink-400 hover:text-white text-sm p-1 font-bold shrink-0"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-pink-100/90 my-4 leading-relaxed">
              Authenticate via Email, Google, or Passkeys to delegate policy-scoped execution permissions to the autonomous AI Agent.
            </p>

            <form onSubmit={handleSimulatedLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1.5">
                  Email Address / Web3 ID
                </label>
                <input
                  type="email"
                  required
                  placeholder="builder@ethglobal.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#0a0410] border border-pink-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-pink-400/40 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-rose-600 hover:from-orange-600 hover:via-pink-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Authenticating...' : 'Continue with Privy'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-pink-900/40 text-[10px] text-center text-pink-300/70">
              Privy App ID: <span className="font-mono text-amber-300 font-bold">cmtojqa83003h0cjxy26txns2</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
