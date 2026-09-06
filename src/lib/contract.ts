import { ethers } from 'ethers';
import agentVaultArtifact from '../contracts/artifacts/AgentVault.json';

const RPC_URL = process.env.RPC_URL || 'https://sepolia.base.org';
export const VAULT_CONTRACT_ADDRESS = process.env.VAULT_ADDRESS || '0x3F8B3e8F6B738bC2547b7bA9C8aE4E594bDb91D4';

// Initialize Read-Only Provider for Base Sepolia
export function getEVMProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

// Get AgentVault Contract Instance
export function getAgentVaultContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const provider = signerOrProvider || getEVMProvider();
  return new ethers.Contract(VAULT_CONTRACT_ADDRESS, agentVaultArtifact.abi, provider);
}

// Encode calldata for Agent execution via Privy Server Wallet
export function encodeStrategyCalldata(strategyId: number, amountWei: bigint, action: string): string {
  const iface = new ethers.Interface(agentVaultArtifact.abi);
  return iface.encodeFunctionData('executeStrategy', [strategyId, amountWei, action]);
}

export function encodeRebalanceCalldata(fromId: number, toId: number, amountWei: bigint): string {
  const iface = new ethers.Interface(agentVaultArtifact.abi);
  return iface.encodeFunctionData('rebalance', [fromId, toId, amountWei]);
}
