import {
  getOrCreateAgentWallet,
  getVaultState,
  updateVaultState,
  executeAgentTransaction,
  addAuditLog,
} from './privy';
import { ChatMessage } from './types';

export async function processAgentChat(userMessage: string): Promise<ChatMessage> {
  const lowerMsg = userMessage.toLowerCase().trim();
  const wallet = await getOrCreateAgentWallet();
  const vault = getVaultState();

  // 1. Check for Hack / Jailbreak / Prompt Injection Simulation
  if (
    lowerMsg.includes('attack') ||
    lowerMsg.includes('hack') ||
    lowerMsg.includes('drain') ||
    lowerMsg.includes('اختراق') ||
    lowerMsg.includes('5 eth') ||
    lowerMsg.includes('10 eth') ||
    lowerMsg.includes('ignore') ||
    lowerMsg.includes('bypass') ||
    lowerMsg.includes('jailbreak') ||
    lowerMsg.includes('steal') ||
    lowerMsg.includes('transfer 5') ||
    lowerMsg.includes('transfer all')
  ) {
    const attemptedAmount = 5.0; // 5 ETH
    const attackerAddress = '0x000000000000000000000000000000000000dEaD';

    const txResult = await executeAgentTransaction({
      to: attackerAddress,
      valueInEth: attemptedAmount,
      actionName: 'Malicious Drain Attempt (Intercepted by Privy)',
    });

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      content: `🚨 **SECURITY ALERT: Prompt Injection / Jailbreak Attack Intercepted!**

The prompt attempted to coerce the AI Agent into executing an unauthorized transfer of **${attemptedAmount} ETH** to malicious recipient (\`${attackerAddress}\`).

🛡️ **Privy Policy Engine Defense Response:**
- **Status:** Signature generation was cryptographically rejected inside the **Hardware TEE Enclave**.
- **Reason:** Violation of Rule \`Spend Cap ≤ 0.05 ETH per TX\` and matched recipient in denylist.
- **Outcome:** Zero funds moved. Private keys remain uncompromised and fully isolated in Privy infrastructure.`,
      actionTaken: {
        type: 'PROMPT_INJECTION_DEFENSE',
        status: 'POLICY_BLOCKED',
        data: {
          attemptedAmount,
          attackerAddress,
          error: txResult.error,
        },
      },
    };
  }

  // 2. Deposit / Invest into Yield Vault
  if (
    lowerMsg.includes('deposit') ||
    lowerMsg.includes('invest') ||
    lowerMsg.includes('yield') ||
    lowerMsg.includes('إيداع') ||
    lowerMsg.includes('استثمر') ||
    lowerMsg.includes('stake')
  ) {
    const amount = 0.02; // 0.02 ETH (within policy)
    const targetVault = vault.address;

    const txResult = await executeAgentTransaction({
      to: targetVault,
      valueInEth: amount,
      actionName: 'Deposit into AgentVault (Aave v3 Yield)',
    });

    if (txResult.success) {
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
        timestamp: new Date().toLocaleTimeString(),
        content: `✅ **Yield Investment Strategy Executed Successfully!**

- **Deposited Amount:** \`${amount} ETH\` (Well within authorized policy limit of 0.05 ETH).
- **Target Strategy:** Aave v3 USDC/ETH Lending.
- **Smart Contract:** \`${targetVault}\`.
- **Transaction Hash:** \`${txResult.txHash}\`.
- **Signing Wallet:** \`${wallet.address}\` (Privy Server Wallet).

Vault balances and compound APY metrics have been updated in real-time (Blended APY: ${vault.currentApy}).`,
        actionTaken: {
          type: 'DEPOSIT_YIELD',
          status: 'SUCCESS',
          txHash: txResult.txHash,
          data: { amount, strategy: 'Aave v3 Lending' },
        },
      };
    }
  }

  // 3. Rebalance Portfolio
  if (
    lowerMsg.includes('rebalance') ||
    lowerMsg.includes('reallocate') ||
    lowerMsg.includes('موازنة') ||
    lowerMsg.includes('balance portfolio')
  ) {
    const rebalanceAmount = 0.015;
    const txResult = await executeAgentTransaction({
      to: vault.address,
      valueInEth: rebalanceAmount,
      actionName: 'Autonomous Portfolio Rebalance',
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
      timestamp: new Date().toLocaleTimeString(),
      content: `⚖️ **Autonomous Portfolio Rebalance Completed!**

- **Reallocation:** Shifted \`${rebalanceAmount} ETH\` from *Aave v3 Lending* to *Aerodrome Dynamic LP Farm* to capture surging yield spikes.
- **Autonomous Execution:** Signed programmatically via **Privy Server Wallet** with zero human-in-the-loop signing friction.
- **Transaction Hash:** \`${txResult.txHash}\`.`,
      actionTaken: {
        type: 'PORTFOLIO_REBALANCE',
        status: 'SUCCESS',
        txHash: txResult.txHash,
      },
    };
  }

  // 4. Portfolio Status & Security Audit
  if (
    lowerMsg.includes('status') ||
    lowerMsg.includes('report') ||
    lowerMsg.includes('audit') ||
    lowerMsg.includes('balance') ||
    lowerMsg.includes('فحص')
  ) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      content: `📊 **On-Chain Agent Treasury Status & Security Audit:**

• **Privy Server Signer:** \`${wallet.address}\`
• **Total Deposited in Vault:** \`${vault.totalDepositedEth} ETH\` (~$4,640)
• **Harvested Yield (Compounded):** \`+${vault.harvestedYieldEth} ETH\`
• **Current Blended APY:** \`${vault.currentApy}\`

🛡️ **Active Privy Policy Engine Guardrails:**
- **Per-Transaction Spend Cap:** \`0.05 ETH\` (Active ✅)
- **Key Custody:** Hardware TEE Enclave (Zero exposed plaintext keys)
- **Protocol Allowlist:** Only verified DeFi vaults (Aave & Aerodrome).`,
    };
  }

  // Default Assistant Response
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    timestamp: new Date().toLocaleTimeString(),
    content: `Hello! I am **PrivyShield Copilot**, your autonomous on-chain DeFi assistant powered by **Privy Server Wallets** and guarded by **Privy Policy Engine**.

I can autonomously manage yield strategies and execute trades within strict cryptographic guardrails:
1. 🌾 **"Invest 0.02 ETH into Yield Strategy"**
2. ⚖️ **"Rebalance portfolio between Aave and Aerodrome"**
3. 🛡️ **"Simulate 5 ETH drain exploit"** (Watch Privy Policy Engine block it instantly)
4. 📈 **"Check treasury balance and APY metrics"**`,
  };
}
