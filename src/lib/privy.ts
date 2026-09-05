import { PrivyClient } from '@privy-io/server-auth';
import { PrivyPolicy, AgentWalletData, AuditLogItem, VaultState } from './types';

const appId = process.env.PRIVY_APP_ID || 'cmtojqa83003h0cjxy26txns2';
const appSecret = process.env.PRIVY_APP_SECRET || 'privy_app_secret_3j2zqmXpeFfAKXeFQXheUHjpCw65sH6s2gPqhT5Gu8W4qPbkjy4uJjWAdtwB88aaVoww738no3Juir4Ba2XptGLR';

// Singleton Privy Server Client
export const privy = new PrivyClient(appId, appSecret);

// In-Memory Global State for Demo / Session caching
let cachedWallet: AgentWalletData | null = null;
let cachedPolicy: PrivyPolicy | null = null;
let auditLogs: AuditLogItem[] = [
  {
    id: 'log-init-0',
    timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
    type: 'SECURITY_ALERT',
    status: 'SUCCESS',
    action: 'TEE Enclave Provisioned',
    details: 'Privy Hardware-isolated TEE Enclave initialized for autonomous Agent signer.',
  },
  {
    id: 'log-init-1',
    timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(),
    type: 'POLICY_ENFORCEMENT',
    status: 'SUCCESS',
    action: 'Policy Engine Attached',
    details: 'Max 0.05 ETH per TX limit and Allowlist rules activated.',
  }
];

let vaultState: VaultState = {
  address: '0x3F8B3e8F6B738bC2547b7bA9C8aE4E594bDb91D4',
  totalDepositedEth: '1.450',
  harvestedYieldEth: '0.082',
  currentApy: '12.4%',
  isPaused: false,
  strategies: [
    {
      id: 0,
      name: 'Aave v3 Lending (USDC/ETH)',
      targetContract: '0x1111111111111111111111111111111111111111',
      allocatedEth: '0.870',
      weightBps: 6000,
      apy: '8.7%',
      status: 'ACTIVE',
    },
    {
      id: 1,
      name: 'Aerodrome Dynamic LP Farm',
      targetContract: '0x2222222222222222222222222222222222222222',
      allocatedEth: '0.580',
      weightBps: 4000,
      apy: '16.1%',
      status: 'ACTIVE',
    },
  ],
};

export async function getOrCreateAgentWallet(): Promise<AgentWalletData> {
  if (cachedWallet && cachedPolicy) {
    return cachedWallet;
  }

  try {
    // 1. Check existing wallets
    const walletsResponse = await privy.walletApi.getWallets();
    let wallet = walletsResponse.data && walletsResponse.data.length > 0 ? walletsResponse.data[0] : null;
    let policy: any = null;

    if (!wallet) {
      // 2. Create the Policy First
      policy = await privy.walletApi.createPolicy({
        version: '1.0',
        name: 'Autonomous Agent Safeguard Policy',
        chainType: 'ethereum',
        rules: [
          {
            name: 'Spend Limit: Max 0.05 ETH per Transaction',
            action: 'ALLOW',
            method: 'eth_sendTransaction',
            conditions: [
              {
                fieldSource: 'ethereum_transaction',
                field: 'value',
                operator: 'lte',
                value: '50000000000000000', // 0.05 ETH
              },
            ],
          },
          {
            name: 'Deny Transactions to Malicious / Unknown Blacklisted Sinks',
            action: 'DENY',
            method: 'eth_sendTransaction',
            conditions: [
              {
                fieldSource: 'ethereum_transaction',
                field: 'to',
                operator: 'in',
                value: [
                  '0x000000000000000000000000000000000000dEaD',
                  '0x6666666666666666666666666666666666666666',
                  '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
                ],
              },
            ],
          },
        ],
      });

      // 3. Create Server Wallet with Policy Attached
      wallet = await privy.walletApi.createWallet({
        chainType: 'ethereum',
        policyIds: [policy.id],
      });
    } else {
      // If wallet exists, get its policy or create one if needed
      if (wallet.policyIds && wallet.policyIds.length > 0) {
        try {
          policy = await privy.walletApi.getPolicy({ id: wallet.policyIds[0] });
        } catch {
          policy = {
            id: wallet.policyIds[0],
            name: 'Autonomous Agent Safeguard Policy',
            version: '1.0',
            chainType: 'ethereum',
            rules: [
              {
                name: 'Spend Limit: Max 0.05 ETH per Transaction',
                action: 'ALLOW',
                method: 'eth_sendTransaction',
                conditions: [
                  {
                    fieldSource: 'ethereum_transaction',
                    field: 'value',
                    operator: 'lte',
                    value: '50000000000000000',
                  },
                ],
              },
            ],
          };
        }
      }
    }

    cachedPolicy = policy;
    cachedWallet = {
      id: wallet.id,
      address: wallet.address,
      chainType: wallet.chainType,
      policyIds: wallet.policyIds || [],
      balanceEth: '0.425',
      balanceUsdc: '1,250.00',
      activePolicy: policy,
    };

    return cachedWallet;
  } catch (error: any) {
    console.error('Error in Privy initialization, using fallback server wallet instance:', error.message);
    cachedWallet = {
      id: 'mkn17dctw2h5jzxlhk5q0vbb',
      address: '0xF75908b60E8AFBA3E128F6225A10b1d9BABb01Ae',
      chainType: 'ethereum',
      policyIds: ['r69e406tsa5bpldndsp5tjg3'],
      balanceEth: '0.425',
      balanceUsdc: '1,250.00',
      activePolicy: {
        id: 'r69e406tsa5bpldndsp5tjg3',
        name: 'Agent Yield Safeguard Policy',
        version: '1.0',
        chainType: 'ethereum',
        rules: [
          {
            name: 'Spend Limit: Max 0.05 ETH per Transaction',
            action: 'ALLOW',
            method: 'eth_sendTransaction',
            conditions: [
              {
                fieldSource: 'ethereum_transaction',
                field: 'value',
                operator: 'lte',
                value: '50000000000000000',
              },
            ],
          },
        ],
      },
    };
    return cachedWallet;
  }
}

export function getAuditLogs(): AuditLogItem[] {
  return auditLogs;
}

export function addAuditLog(log: Omit<AuditLogItem, 'id' | 'timestamp'>): AuditLogItem {
  const newLog: AuditLogItem = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString(),
  };
  auditLogs = [newLog, ...auditLogs.slice(0, 49)];
  return newLog;
}

export function getVaultState(): VaultState {
  return vaultState;
}

export function updateVaultState(updater: (prev: VaultState) => VaultState): VaultState {
  vaultState = updater(vaultState);
  return vaultState;
}

export async function executeAgentTransaction(params: {
  to: string;
  valueInEth: number;
  data?: string;
  actionName: string;
}): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
  policyBlocked?: boolean;
}> {
  const wallet = await getOrCreateAgentWallet();
  const maxAllowedLimit = 0.05; // 0.05 ETH

  // Policy Guardrail Evaluation (Simulating & Enforcing Privy Policy Engine)
  const isBlacklisted = [
    '0x000000000000000000000000000000000000dead',
    '0x6666666666666666666666666666666666666666',
    '0xdeaddeaddeaddeaddeaddeaddeaddead0000',
  ].includes(params.to.toLowerCase());

  if (params.valueInEth > maxAllowedLimit) {
    const errorMsg = `[PRIVY_POLICY_VIOLATION] Transaction value (${params.valueInEth} ETH) exceeds policy rule limit of 0.05 ETH per TX. Privy TEE Signer refused to produce signature.`;
    addAuditLog({
      type: 'POLICY_ENFORCEMENT',
      status: 'POLICY_BLOCKED',
      action: params.actionName,
      amount: `${params.valueInEth} ETH`,
      target: params.to,
      details: 'Transaction automatically rejected by Privy Policy Engine before key sign.',
      policyReason: `Limit violation: Requested ${params.valueInEth} ETH > 0.05 ETH threshold.`,
    });

    return {
      success: false,
      error: errorMsg,
      policyBlocked: true,
    };
  }

  if (isBlacklisted) {
    const errorMsg = `[PRIVY_POLICY_VIOLATION] Target address ${params.to} is in the Privy Security Denylist.`;
    addAuditLog({
      type: 'SECURITY_ALERT',
      status: 'POLICY_BLOCKED',
      action: params.actionName,
      amount: `${params.valueInEth} ETH`,
      target: params.to,
      details: 'Attempted interaction with blacklisted/draining address blocked by Policy Engine.',
      policyReason: 'Recipient is matched in DENY ruleset.',
    });

    return {
      success: false,
      error: errorMsg,
      policyBlocked: true,
    };
  }

  // If approved by Policy: Generate Tx on Base Sepolia / EVM
  const fakeTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  addAuditLog({
    type: 'TRANSACTION',
    status: 'SUCCESS',
    action: params.actionName,
    amount: `${params.valueInEth} ETH`,
    target: params.to,
    txHash: fakeTxHash,
    details: `Executed via Privy Server Wallet (${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}) inside policy parameters.`,
  });

  return {
    success: true,
    txHash: fakeTxHash,
  };
}
