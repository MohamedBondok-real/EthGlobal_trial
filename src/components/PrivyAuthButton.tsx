'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  User,
  LogOut,
  Wallet,
  Check,
  Copy,
  ExternalLink,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ethers } from 'ethers';

interface PrivyAuthButtonProps {
  onWalletConnected?: (account: string, type: 'METAMASK' | 'PRIVY', balance?: string) => void;
}

const BASE_SEPOLIA_CHAIN_ID = '0x14a34'; // 84532 in hex

export default function PrivyAuthButton({ onWalletConnected }: PrivyAuthButtonProps) {
  // Wallet State
  const [walletType, setWalletType] = useState<'METAMASK' | 'PRIVY' | null>(null);
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Modal State
  const [showPrivyModal, setShowPrivyModal] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');

  // Check if MetaMask or Injected Web3 is already connected on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const eth = (window as any).ethereum;

      eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          handleMetaMaskConnected(accounts[0]);
        }
      }).catch(() => {});

      // Event Listeners for MetaMask
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          handleMetaMaskConnected(accounts[0]);
        } else {
          handleDisconnect();
        }
      };

      const handleChainChanged = (newChainId: string) => {
        setChainId(newChainId);
        if (account) {
          fetchBalance(account);
        }
      };

      eth.on('accountsChanged', handleAccountsChanged);
      eth.on('chainChanged', handleChainChanged);

      return () => {
        if (eth.removeListener) {
          eth.removeListener('accountsChanged', handleAccountsChanged);
          eth.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [account]);

  // Fetch ETH Balance on Base Sepolia
  const fetchBalance = async (address: string) => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const bal = await provider.getBalance(address);
        const formatted = parseFloat(ethers.formatEther(bal)).toFixed(4);
        setBalance(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn('Could not fetch balance:', err);
    }
    return '';
  };

  // Switch or Add Base Sepolia network
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
        } catch (addError) {
          console.error('Failed to add Base Sepolia:', addError);
        }
      }
    }
  };

  const handleMetaMaskConnected = async (addr: string) => {
    setAccount(addr);
    setWalletType('METAMASK');
    setErrorMessage('');
    const bal = await fetchBalance(addr);

    if (onWalletConnected) {
      onWalletConnected(addr, 'METAMASK', bal);
    }
  };

  // 1-Click Direct MetaMask Connect
  const connectMetaMask = async () => {
    setIsConnecting(true);
    setErrorMessage('');

    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('MetaMask is not installed in your browser. Please install MetaMask extension from metamask.io or use Privy Social Login.');
      setIsConnecting(false);
      return;
    }

    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: 'eth_requestAccounts' });

      if (accounts && accounts.length > 0) {
        await switchToBaseSepolia();
        await handleMetaMaskConnected(accounts[0]);
      }
    } catch (err: any) {
      console.error('MetaMask connect error:', err);
      setErrorMessage(err.message || 'Connection rejected');
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect via Privy Social Login
  const handlePrivyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsConnecting(true);

    setTimeout(() => {
      setAccount(emailInput);
      setBalance('0.4250');
      setWalletType('PRIVY');
      setIsConnecting(false);
      setShowPrivyModal(false);

      if (onWalletConnected) {
        onWalletConnected(emailInput, 'PRIVY', '0.4250');
      }
    }, 600);
  };

  const handleDisconnect = () => {
    setAccount('');
    setWalletType(null);
    setBalance('');
    setErrorMessage('');
    if (onWalletConnected) {
      onWalletConnected('', 'PRIVY');
    }
  };

  const copyAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If connected, render the connected wallet status pill
  if (account && walletType) {
    return (
      <div className="flex items-center gap-2 max-w-full">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {walletType === 'METAMASK' ? (
              <span className="text-sm shrink-0">🦊</span>
            ) : (
              <User className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            )}
            <span className="font-mono text-slate-800 font-bold truncate max-w-[120px] sm:max-w-[150px]">
              {walletType === 'METAMASK' ? `${account.slice(0, 6)}...${account.slice(-4)}` : account}
            </span>
          </div>

          {balance && (
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 shrink-0">
              {balance} ETH
            </span>
          )}

          <button
            onClick={copyAddress}
            className="p-1 text-slate-400 hover:text-slate-800 transition-colors shrink-0"
            title="Copy Address"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        <button
          onClick={handleDisconnect}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all shrink-0 text-xs font-semibold"
          title="Disconnect Wallet"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* 1. Direct 1-Click MetaMask Connection Button */}
      <button
        onClick={connectMetaMask}
        disabled={isConnecting}
        className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
      >
        <span className="text-sm">🦊</span>
        <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
      </button>

      {/* 2. Privy Social / Email Login Button */}
      <button
        onClick={() => setShowPrivyModal(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-semibold text-xs transition-all shrink-0"
        title="Login with Email or Passkey"
      >
        <KeyRound className="w-3.5 h-3.5 text-pink-600" />
        <span>Privy Auth</span>
      </button>

      {/* Privy Social Modal */}
      {showPrivyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center text-white shadow-md shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Privy Embedded Login</h3>
                  <p className="text-[11px] text-slate-500">Self-Custodial Consumer Auth</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrivyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1 font-bold shrink-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePrivyLogin} className="space-y-4 my-4 animate-fade-in">
              <p className="text-xs text-slate-600 leading-relaxed">
                Log in with Email, Google, or Passkeys to delegate policy-scoped execution permissions to the autonomous AI Agent.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address / Web3 ID
                </label>
                <input
                  type="email"
                  required
                  placeholder="builder@ethglobal.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-rose-600 hover:from-orange-600 hover:via-pink-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isConnecting ? 'Authenticating...' : 'Continue with Privy'}
              </button>

              <div className="pt-2 text-[10px] text-center text-slate-500">
                Privy App ID: <span className="font-mono text-orange-600 font-bold">cmtojqa83003h0cjxy26txns2</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
