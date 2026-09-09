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
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-950/60 border border-pink-500/40 text-xs text-pink-200 shadow-sm">
          <User className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-mono">{userEmail}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg bg-pink-950/40 hover:bg-pink-900/50 text-pink-300 hover:text-white border border-pink-800/40 transition-colors"
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
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 hover:from-orange-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold text-xs shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.03] active:scale-[0.98]"
      >
        <KeyRound className="w-4 h-4" />
        <span>Privy Social Login</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#140b1d] border border-pink-500/40 p-6 shadow-2xl shadow-pink-950/80 relative">
            <div className="flex items-center justify-between pb-4 border-b border-pink-900/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Privy Embedded Login</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-pink-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-pink-200/70 my-4 leading-relaxed">
              Authenticate via Email, Google, or Passkeys to delegate policy-scoped execution permissions to the autonomous AI Agent.
            </p>

            <form onSubmit={handleSimulatedLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-pink-200 mb-1">
                  Email Address / Web3 ID
                </label>
                <input
                  type="email"
                  required
                  placeholder="builder@ethglobal.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#0a050f] border border-pink-900/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-pink-400/40 focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold text-xs shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Authenticating...' : 'Continue with Privy'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-pink-900/40 text-[10px] text-center text-pink-400/60">
              App ID: <span className="font-mono text-orange-400">cmtojqa83003h0cjxy26txns2</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
