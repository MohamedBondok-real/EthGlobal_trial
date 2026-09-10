'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  Bot,
  KeyRound,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  Fingerprint,
  Cpu,
  Layers,
  Sliders,
  Check,
  Copy,
  Info
} from 'lucide-react';
import { ethers } from 'ethers';

const BASE_SEPOLIA_CHAIN_ID = '0x14a34'; // 84532 in hex

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'email' | 'wallet' | 'social' | 'passkey'>('email');

  // Form inputs
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'input' | 'verify' | 'complete'>('input');
  const [selectedSpendCap, setSelectedSpendCap] = useState('0.05');

  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Wallet connection state
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setConnectedWallet(accounts[0]);
          fetchWalletBalance(accounts[0]);
        }
      }).catch(() => {});
    }
  }, []);

  const fetchWalletBalance = async (addr: string) => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const bal = await provider.getBalance(addr);
        const formatted = parseFloat(ethers.formatEther(bal)).toFixed(4);
        setWalletBalance(formatted);
      }
    } catch (e) {
      console.warn('Could not fetch balance', e);
    }
  };

  const switchToBaseSepolia = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    const eth = (window as any).ethereum;
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
        try {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: BASE_SEPOLIA_CHAIN_ID,
                chainName: 'Base Sepolia Testnet',
                nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              },
            ],
          });
        } catch (addErr) {
          console.error('Error adding Base Sepolia', addErr);
        }
      }
    }
  };

  // 1-Click MetaMask Connect
  const handleMetaMaskAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');

    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setErrorMsg('MetaMask extension is not detected. Please install MetaMask or use Email / Social login.');
      setIsLoading(false);
      return;
    }

    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        await switchToBaseSepolia();
        const addr = accounts[0];
        setConnectedWallet(addr);
        await fetchWalletBalance(addr);

        // Save session
        if (typeof window !== 'undefined') {
          localStorage.setItem('privy_user_session', JSON.stringify({
            type: 'METAMASK',
            account: addr,
            spendCap: selectedSpendCap,
            loggedInAt: new Date().toISOString(),
          }));
        }

        setSuccessMsg(`MetaMask successfully connected: ${addr.slice(0, 6)}...${addr.slice(-4)}`);
        setTimeout(() => {
          router.push('/');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'MetaMask connection was rejected.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Submit (Step 1: Request OTP)
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // Simulate Privy Email OTP Dispatch
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
      setSuccessMsg(`6-digit verification code sent to ${email}`);
    }, 800);
  };

  // Handle OTP Digit Input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP Submit (Step 2: Verify & Provision)
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      setStep('complete');
      
      const userPayload = {
        type: 'PRIVY_EMBEDDED',
        email,
        username: username || email.split('@')[0],
        spendCap: selectedSpendCap,
        embeddedWallet: '0x71C...8E24',
        loggedInAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('privy_user_session', JSON.stringify(userPayload));
      }

      setSuccessMsg(mode === 'register' ? '🎉 Privy Embedded Smart Wallet successfully provisioned!' : '🎉 Welcome back! Signed in securely.');

      setTimeout(() => {
        router.push('/');
      }, 1500);
    }, 1000);
  };

  // Handle 1-Click Social Sign-In (Google / GitHub / Passkeys)
  const handleSocialAuth = (providerName: string) => {
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      const userPayload = {
        type: 'PRIVY_SOCIAL',
        provider: providerName,
        account: `${providerName.toLowerCase()}_user@ethglobal.io`,
        spendCap: selectedSpendCap,
        loggedInAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('privy_user_session', JSON.stringify(userPayload));
      }

      setSuccessMsg(`Authenticated via ${providerName} with Privy embedded wallet!`);
      setTimeout(() => {
        router.push('/');
      }, 1200);
    }, 900);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-6 sm:py-10">
      {/* Back to Home Link */}
      <div className="max-w-4xl mx-auto w-full mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors px-3 py-1.5 rounded-xl bg-white/80 border border-slate-200 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Col (5 cols): Value Proposition & Security Architecture */}
        <div className="lg:col-span-5 card-glass-glow rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-black text-slate-900 tracking-tight">PrivyShield AI</span>
                <span className="block text-[10px] text-pink-700 font-bold uppercase tracking-wider">ETHGlobal 2026</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {mode === 'register' ? 'Provision Your Self-Custodial AI Agent Wallet' : 'Secure Access to Your On-Chain Copilot'}
            </h2>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Authenticate via embedded email or Web3 wallet. Delegate granular, cryptographic policy rules to your autonomous DeFi agent on <strong>Base Sepolia</strong>.
            </p>

            {/* Feature List */}
            <div className="mt-6 space-y-3.5">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/70 border border-orange-100 shadow-xs">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-700 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Privy Policy Engine Gate</h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Strict per-transaction spend caps prevent unauthorized signature drainage even if AI is compromised.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/70 border border-pink-100 shadow-xs">
                <div className="p-2 rounded-xl bg-pink-100 text-pink-700 shrink-0 mt-0.5">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Zero Seed-Phrase Friction</h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Embedded wallets with secure Shamir secret key sharding directly tied to email or passkeys.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/70 border border-purple-100 shadow-xs">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Autonomous Server Wallets</h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    AI agent executes yield compounding & portfolio rebalancing 24/7 within your defined limits.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-orange-200/50 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Base Sepolia (84532)</span>
            </span>
            <span className="font-mono text-orange-600 font-bold">App ID: cmtojqa83...</span>
          </div>
        </div>

        {/* Right Col (7 cols): Main Auth Card (Tabs: Login / Register) */}
        <div className="lg:col-span-7 card-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Tab Switcher: Login vs Register */}
            <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setStep('input');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4 text-orange-500" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setStep('input');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error / Success Feedback Banners */}
            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* Step 1: Input Details (Email / Wallet / Social) */}
            {step === 'input' && (
              <div className="space-y-5 animate-fade-in">
                {/* 1. Direct Web3 Wallet Option (MetaMask) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Option A: Connect Web3 Browser Wallet
                  </label>
                  <button
                    type="button"
                    onClick={handleMetaMaskAuth}
                    disabled={isLoading}
                    className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🦊</span>
                      <div className="text-left">
                        <div className="font-bold">Connect with MetaMask</div>
                        <div className="text-[10px] text-amber-100 font-normal">Auto-switches to Base Sepolia (84532)</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or sign in with email</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* 2. Email OTP Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Username / Web3 Identity
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="alice.eth"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="builder@ethglobal.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Policy Limit Preset for Register */}
                  {mode === 'register' && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-orange-500" /> Default Agent Spend Cap
                        </span>
                        <span className="font-mono text-orange-600 font-bold">{selectedSpendCap} ETH / tx</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['0.02', '0.05', '0.10'].map((cap) => (
                          <button
                            key={cap}
                            type="button"
                            onClick={() => setSelectedSpendCap(cap)}
                            className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              selectedSpendCap === cap
                                ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {cap} ETH
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-rose-600 hover:from-orange-600 hover:via-pink-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span>Sending OTP...</span>
                    ) : (
                      <>
                        <span>{mode === 'register' ? 'Create Embedded Wallet' : 'Continue with Email'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* 3. Social & Passkey Logins */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 mb-2.5 text-center">
                    Or continue with social / passkeys
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSocialAuth('Google')}
                      disabled={isLoading}
                      className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <span>🌐</span>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialAuth('GitHub')}
                      disabled={isLoading}
                      className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <span>🐱</span>
                      <span>GitHub</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialAuth('Passkey')}
                      disabled={isLoading}
                      className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Fingerprint className="w-3.5 h-3.5 text-pink-600" />
                      <span>Passkey</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Verification Code (OTP) */}
            {step === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 mx-auto">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Enter 6-Digit Verification Code</h3>
                  <p className="text-xs text-slate-500">
                    We sent an authentication passcode to <strong className="text-slate-800">{email}</strong>
                  </p>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 my-4">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          const prevInput = document.getElementById(`otp-input-${index - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg bg-slate-50 border-2 border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl text-slate-900 focus:outline-none transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-rose-600 hover:from-orange-600 hover:via-pink-600 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Authorize Agent'}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="hover:text-slate-800 underline"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessMsg(`Resent code to ${email}`);
                    }}
                    className="text-pink-600 hover:text-pink-700 font-bold"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Complete / Provisioned */}
            {step === 'complete' && (
              <div className="text-center py-6 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Wallet Provisioned & Guardrails Configured</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Redirecting you to the PrivyShield Copilot Command Center...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Non-Custodial Key Security</span>
            <span className="font-semibold text-slate-700">Protected by Privy Policy Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
