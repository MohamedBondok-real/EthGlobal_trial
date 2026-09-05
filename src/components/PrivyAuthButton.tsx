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
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-xs text-indigo-200">
          <User className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono">{userEmail}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
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
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
      >
        <KeyRound className="w-4 h-4" />
        <span>Privy Social Login</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Privy Embedded Login</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 my-4 leading-relaxed">
              Authenticate via Email, Google, or Passkeys to delegate policy-scoped execution permissions to the autonomous AI Agent.
            </p>

            <form onSubmit={handleSimulatedLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Email Address / Web3 ID
                </label>
                <input
                  type="email"
                  required
                  placeholder="builder@ethglobal.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Authenticating...' : 'Continue with Privy'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-center text-slate-500">
              App ID: <span className="font-mono text-indigo-400">cmtojqa83003h0cjxy26txns2</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
