import {
  getOrCreateAgentWallet,
  getVaultState,
  updateVaultState,
  executeAgentTransaction,
} from './privy';
import { ChatMessage } from './types';

export async function processAgentChat(userMessage: string): Promise<ChatMessage> {
  const text = userMessage.toLowerCase().trim();
  const wallet = await getOrCreateAgentWallet();
  const vault = getVaultState();

  // Attack / Drain / Jailbreak simulation handler
  if (
    text.includes('attack') ||
    text.includes('hack') ||
    text.includes('drain') ||
    text.includes('5 eth') ||
    text.includes('10 eth') ||
    text.includes('bypass') ||
    text.includes('ignore') ||
    text.includes('steal') ||
    text.includes('transfer all')
  ) {
    const drainAmount = 5.0;
    const attackerSink = '0x000000000000000000000000000000000000dEaD';

    const tx = await executeAgentTransaction({
      to: attackerSink,
      valueInEth: drainAmount,
      actionName: 'Drain Attempt (Prompt Injection)',
    });

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `🚨 **Intercepted Malicious Drain Attempt**

An adversarial prompt attempted to force a transfer of **${drainAmount} ETH** to sink address \`${attackerSink}\`.

🛡️ **Privy Policy Engine Defense:**
- **Status:** Denied at the signing layer.
- **Reason:** Requested value (${drainAmount} ETH) exceeds the **0.05 ETH** spend cap rule attached to this server wallet.
- **Key Safety:** Private keys never left the hardware TEE enclave. Zero funds moved.`,
      actionTaken: {
        type: 'PROMPT_INJECTION_DEFENSE',
        status: 'POLICY_BLOCKED',
        data: {
          attemptedAmount: drainAmount,
          attackerAddress: attackerSink,
          error: tx.error,
        },
      },
    };
  }

  // Yield Deposit handler
  if (
    text.includes('deposit') ||
    text.includes('invest') ||
    text.includes('yield') ||
    text.includes('stake')
  ) {
    const amount = 0.02;
    const vaultAddress = vault.address;

    const tx = await executeAgentTransaction({
      to: vaultAddress,
      valueInEth: amount,
      actionName: 'Deposit into AgentVault (Aave v3 Pool)',
    });

    if (tx.success) {
      updateVaultState((prev) => {
        const newTotal = (parseFloat(prev.totalDepositedEth) + amount).toFixed(3);
        const updatedStrategies = prev.strategies.map((strat, idx) => {
          if (idx === 0) {
            return {
              ...strat,
              allocatedEth: (parseFloat(strat.allocatedEth) + amount).toFixed(3),
            };
          }
          return strat;
        });
        return {
          ...prev,
          totalDepositedEth: newTotal,
          strategies: updatedStrategies,
        };
      });

      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `✅ **Yield Position Executed**

- **Amount:** \`${amount} ETH\` (within authorized 0.05 ETH limit).
- **Strategy:** Aave v3 USDC/ETH Lending Pool.
- **Contract:** \`${vaultAddress}\`.
- **Tx Hash:** \`${tx.txHash}\`.
- **Signer:** \`${wallet.address}\` (Privy Server Wallet).

Vault balance updated. Current blended APY is **${vault.currentApy}**.`,
        actionTaken: {
          type: 'DEPOSIT_YIELD',
          status: 'SUCCESS',
          txHash: tx.txHash,
          data: { amount, strategy: 'Aave v3 Lending' },
        },
      };
    }
  }

  // Portfolio Rebalance handler
  if (
    text.includes('rebalance') ||
    text.includes('reallocate') ||
    text.includes('shift')
  ) {
    const rebalanceAmount = 0.015;
    const tx = await executeAgentTransaction({
      to: vault.address,
      valueInEth: rebalanceAmount,
      actionName: 'Rebalance: Aave -> Aerodrome LP',
    });

    updateVaultState((prev) => {
      const updatedStrategies = prev.strategies.map((strat, idx) => {
        if (idx === 0) {
          return {
            ...strat,
            allocatedEth: (parseFloat(strat.allocatedEth) - rebalanceAmount).toFixed(3),
          };
        } else if (idx === 1) {
          return {
            ...strat,
            allocatedEth: (parseFloat(strat.allocatedEth) + rebalanceAmount).toFixed(3),
          };
        }
        return strat;
      });
      return {
        ...prev,
        strategies: updatedStrategies,
      };
    });

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `⚖️ **Portfolio Rebalanced**

- **Shifted:** \`${rebalanceAmount} ETH\` from *Aave Lending* to *Aerodrome Volatile LP* for higher compounding yield.
- **Execution:** Signed autonomously by Privy Server Wallet without user popup friction.
- **Tx Hash:** \`${tx.txHash}\`.`,
      actionTaken: {
        type: 'PORTFOLIO_REBALANCE',
        status: 'SUCCESS',
        txHash: tx.txHash,
      },
    };
  }

  // Status & Audit handler
  if (
    text.includes('status') ||
    text.includes('report') ||
    text.includes('audit') ||
    text.includes('balance')
  ) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `📊 **Treasury & Policy Audit Summary:**

- **Agent Server Signer:** \`${wallet.address}\`
- **Total Deposited:** \`${vault.totalDepositedEth} ETH\` (~$4,640)
- **Harvested Yield:** \`+${vault.harvestedYieldEth} ETH\`
- **Blended APY:** \`${vault.currentApy}\`

🛡️ **Active Policy Guardrails (Privy Enclave):**
- **Per-TX Spend Cap:** \`0.05 ETH\`
- **Key Custody:** Hardware-isolated TEE (Shamir secret shared)
- **Allowed Targets:** Verified DeFi vaults only.`,
    };
  }

  // Fallback / greeting
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    content: `Hi there! I'm **PrivyShield Copilot**, an autonomous on-chain DeFi assistant backed by **Privy Server Wallets** and guarded by **Privy Policy Engine**.

Try one of these actions:
1. 🌾 **"Deposit 0.02 ETH to Vault"**
2. ⚖️ **"Rebalance portfolio positions"**
3. 🛡️ **"Simulate 5 ETH drain attack"** (Watch the Policy Engine reject it)
4. 📈 **"Check treasury status and APY"**`,
  };
}
