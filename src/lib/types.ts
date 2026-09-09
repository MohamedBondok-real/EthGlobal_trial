export interface PolicyCondition {
  fieldSource: string;
  field: string;
  operator: 'lte' | 'gte' | 'eq' | 'in' | 'not_in';
  value: string | string[] | number;
}

export interface PolicyRule {
  id?: string;
  name: string;
  action: 'ALLOW' | 'DENY';
  method: string;
  conditions: PolicyCondition[];
}

export interface PrivyPolicy {
  id: string;
  name: string;
  version: string;
  chainType: string;
  rules: PolicyRule[];
  createdAt?: string;
}

export interface AgentWalletData {
  id: string;
  address: string;
  chainType: string;
  policyIds: string[];
  balanceEth: string;
  balanceUsdc: string;
  activePolicy?: PrivyPolicy | null;
}

export interface VaultState {
  address: string;
  totalDepositedEth: string;
  harvestedYieldEth: string;
  currentApy: string;
  isPaused: boolean;
  strategies: {
    id: number;
    name: string;
    targetContract: string;
    allocatedEth: string;
    weightBps: number;
    apy: string;
    status: 'ACTIVE' | 'PAUSED';
  }[];
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  type: 'TRANSACTION' | 'POLICY_ENFORCEMENT' | 'SECURITY_ALERT' | 'STRATEGY_EXECUTION';
  status: 'SUCCESS' | 'POLICY_BLOCKED' | 'WARNING' | 'FAILED';
  action: string;
  amount?: string;
  target?: string;
  txHash?: string;
  explorerUrl?: string;
  details: string;
  policyReason?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionTaken?: {
    type: string;
    status: 'SUCCESS' | 'POLICY_BLOCKED';
    txHash?: string;
    explorerUrl?: string;
    data?: any;
  };
}
