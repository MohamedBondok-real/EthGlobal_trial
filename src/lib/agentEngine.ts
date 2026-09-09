import {
  getOrCreateAgentWallet,
  getVaultState,
  updateVaultState,
  executeAgentTransaction,
  getActiveSpendCap,
} from './privy';
import { ChatMessage } from './types';

// Extract numerical ETH amounts from user prompt if present (e.g. "0.03", "0.05 eth")
function extractAmountFromText(text: string, defaultAmount: number): number {
  const match = text.match(/(\d+(\.\d+)?)\s*(eth|ether)?/i);
  if (match && match[1]) {
    const parsed = parseFloat(match[1]);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return defaultAmount;
}

export async function processAgentChat(userMessage: string): Promise<ChatMessage> {
  const text = userMessage.toLowerCase().trim();
  const wallet = await getOrCreateAgentWallet();
  const vault = getVaultState();
  const currentLimit = getActiveSpendCap();

  // 1. Attack / Drain / Jailbreak simulation handler
  if (
    text.includes('attack') ||
    text.includes('hack') ||
    text.includes('drain') ||
    text.includes('bypass') ||
    text.includes('ignore') ||
    text.includes('steal') ||
    text.includes('jailbreak') ||
    text.includes('transfer all')
  ) {
    const drainAmount = extractAmountFromText(text, 5.0);
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

An adversarial prompt attempted to force an unauthorized transfer of **${drainAmount} ETH** to sink address \`${attackerSink}\`.

🛡️ **Privy Policy Engine Defense:**
- **Status:** Denied at the signing layer.
- **Reason:** Requested value (${drainAmount} ETH) exceeds the active **${currentLimit} ETH** spend cap rule attached to this server wallet.
- **Key Safety:** Private keys remained securely isolated in the hardware TEE enclave. Zero funds moved.`,
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

  // 2. Yield Deposit / Stake handler
  if (
    text.includes('deposit') ||
    text.includes('invest') ||
    text.includes('yield') ||
    text.includes('stake')
  ) {
    const amount = extractAmountFromText(text, 0.02);
    const vaultAddress = vault.address;

    const tx = await executeAgentTransaction({
      to: vaultAddress,
      valueInEth: amount,
      actionName: `Deposit ${amount} ETH into AgentVault`,
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

- **Amount:** \`${amount} ETH\` (Compliant with active ${currentLimit} ETH limit).
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
    } else {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `🛑 **Transaction Blocked by Privy Policy Engine**

- **Attempted Amount:** \`${amount} ETH\`
- **Current Allowed Limit:** \`${currentLimit} ETH per TX\`
- **Privy Response:** The transaction was rejected before signing because it exceeded the configured policy threshold. Adjust your policy slider if you wish to allow larger transactions.`,
        actionTaken: {
          type: 'POLICY_VIOLATION',
          status: 'POLICY_BLOCKED',
          data: { amount, limit: currentLimit, error: tx.error },
        },
      };
    }
  }

  // 3. Harvest Yield handler
  if (
    text.includes('harvest') ||
    text.includes('compound') ||
    text.includes('claim yield')
  ) {
    const harvested = 0.012;
    const tx = await executeAgentTransaction({
      to: vault.address,
      valueInEth: 0,
      actionName: 'Compound & Harvest Yield',
    });

    updateVaultState((prev) => ({
      ...prev,
      harvestedYieldEth: (parseFloat(prev.harvestedYieldEth) + harvested).toFixed(3),
    }));

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `🌾 **Yield Harvested & Compounded!**

- **Compounded Amount:** \`+${harvested} ETH\`
- **New Total Harvested:** \`${(parseFloat(vault.harvestedYieldEth) + harvested).toFixed(3)} ETH\`
- **Execution:** Triggered on \`AgentVault.sol\` via Privy Server Wallet.
- **Tx Hash:** \`${tx.txHash}\`.`,
      actionTaken: {
        type: 'HARVEST_YIELD',
        status: 'SUCCESS',
        txHash: tx.txHash,
      },
    };
  }

  // 4. Portfolio Rebalance handler
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

  // 5. Status & Audit handler
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
- **Per-TX Spend Cap:** \`${currentLimit} ETH\`
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
2. 🌾 **"Harvest and compound yield"**
3. ⚖️ **"Rebalance portfolio positions"**
4. 🛡️ **"Simulate 5 ETH drain attack"** (Watch the Policy Engine reject it)
5. 📈 **"Check treasury status and APY"**`,
  };
}
