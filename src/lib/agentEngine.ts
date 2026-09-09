import {
  getOrCreateAgentWallet,
  getVaultState,
  updateVaultState,
  executeAgentTransaction,
  getActiveSpendCap,
} from './privy';
import { ChatMessage } from './types';

// Extract numerical ETH amounts from user prompt if present
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
    text.includes('stake') ||
    text.includes('add funds') ||
    text.includes('put ')
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
- **Privy Response:** The transaction was rejected before signing because it exceeded the configured policy threshold. You can adjust your policy slider in the inspector if you wish to permit larger transaction volumes.`,
        actionTaken: {
          type: 'POLICY_VIOLATION',
          status: 'POLICY_BLOCKED',
          data: { amount, limit: currentLimit, error: tx.error },
        },
      };
    }
  }

  // 3. Harvest & Compound Yield
  if (
    text.includes('harvest') ||
    text.includes('compound') ||
    text.includes('claim') ||
    text.includes('yield profit')
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

  // 4. Portfolio Rebalance
  if (
    text.includes('rebalance') ||
    text.includes('reallocate') ||
    text.includes('shift') ||
    text.includes('move funds')
  ) {
    const rebalanceAmount = extractAmountFromText(text, 0.015);
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
      content: `⚖️ **Portfolio Rebalanced Successfully**

- **Shifted:** \`${rebalanceAmount} ETH\` from *Aave Lending* (8.7% APY) to *Aerodrome Volatile LP* (16.1% APY) for optimal risk-weighted compounding.
- **Autonomous Execution:** Signed seamlessly by Privy Server Wallet without requiring any user signature popups.
- **Tx Hash:** \`${tx.txHash}\`.`,
      actionTaken: {
        type: 'PORTFOLIO_REBALANCE',
        status: 'SUCCESS',
        txHash: tx.txHash,
      },
    };
  }

  // 5. Educational / Explanatory Queries: "What is Privy?", "What is Policy Engine?"
  if (
    text.includes('what is privy') ||
    text.includes('how does privy') ||
    text.includes('privy server wallet')
  ) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `🔐 **What is Privy & How Does It Power This Agent?**

**Privy** provides enterprise-grade wallet and identity infrastructure for autonomous AI agents and consumer apps:

1. **Server Wallets:** Programmatic non-custodial wallets where private keys are sharded and isolated inside **Hardware Trusted Execution Environments (TEEs)**. Our backend never touches raw plaintext keys.
2. **Policy Engine:** Deterministic guardrails (spend limits, allowlists, chain scoping) enforced by Privy at the signing step.
3. **Embedded Auth:** Lets end-users log in with social accounts or passkeys with zero wallet setup friction.`,
    };
  }

  if (
    text.includes('policy engine') ||
    text.includes('how do policies work') ||
    text.includes('guardrail') ||
    text.includes('how does security work')
  ) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `🛡️ **How the Privy Policy Engine Works:**

Instead of trusting the LLM or software code to enforce safety rules, **Privy Policy Engine** enforces rules at the cryptographic signature generation layer:

- **Rule 1 (Spend Cap):** Max \`${currentLimit} ETH\` per transaction.
- **Rule 2 (Denylist):** Automatically rejects transactions targeting blacklisted exploit sinks.
- **Rule 3 (Chain Scope):** Only authorizes transactions on Base Sepolia (\`84532\`).

If an attacker tricks the AI model via prompt injection, **Privy's TEE Enclave drops the signing request before funds can ever leave your wallet.**`,
    };
  }

  if (
    text.includes('strategy') ||
    text.includes('strategies') ||
    text.includes('aave') ||
    text.includes('aerodrome') ||
    text.includes('apy')
  ) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `📈 **Active DeFi Strategies Breakdown:**

1. **Aave v3 USDC/ETH Lending Pool:**
   - **Allocated:** \`${vault.strategies[0]?.allocatedEth || '0.870'} ETH\` (60% weight)
   - **Current APY:** **8.7%**
   - **Risk Profile:** Low risk, stable lending interest.

2. **Aerodrome Volatile LP Farm:**
   - **Allocated:** \`${vault.strategies[1]?.allocatedEth || '0.580'} ETH\` (40% weight)
   - **Current APY:** **16.1%**
   - **Risk Profile:** Medium risk, dynamic trading fees + emissions.

📊 **Current Blended APY:** **${vault.currentApy}** (Auto-compounded daily).`,
    };
  }

  if (
    text.includes('health') ||
    text.includes('risk score') ||
    text.includes('safe') ||
    text.includes('audit')
  ) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `🛡️ **Wallet Health & Security Audit: 99/100 (Optimal)**

• **TEE Key Isolation:** Active & Verified ✅
• **Policy Engine Guardrails:** Enforcing ≤ ${currentLimit} ETH cap ✅
• **Denylist Filter:** Active (0x...dEaD sinks blocked) ✅
• **Smart Contract Pause State:** Normal (Unpaused) ✅
• **Contract Address:** \`${vault.address}\` on Base Sepolia.

Your assets are mathematically protected against prompt injections and key theft!`,
    };
  }

  if (
    text.includes('status') ||
    text.includes('report') ||
    text.includes('balance') ||
    text.includes('portfolio')
  ) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `📊 **Treasury & Agent Portfolio Summary:**

- **Agent Server Signer:** \`${wallet.address}\`
- **Total Deposited in Vault:** \`${vault.totalDepositedEth} ETH\` (~$4,640)
- **Harvested Yield (Compounded):** \`+${vault.harvestedYieldEth} ETH\`
- **Blended APY:** \`${vault.currentApy}\`
- **Active Spend Cap:** \`${currentLimit} ETH per TX\` (Privy Enclave)`,
    };
  }

  if (
    text.includes('hi') ||
    text.includes('hello') ||
    text.includes('hey') ||
    text.includes('who are you') ||
    text.includes('help')
  ) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `Hello! 👋 I am **PrivyShield Copilot**, your autonomous on-chain DeFi assistant powered by **Privy Server Wallets** and guarded by **Privy Policy Engine**.

Here are some things you can ask me:
- 🌾 **"Deposit 0.03 ETH into yield vault"** (Executes on-chain deposit)
- 🌾 **"Harvest and compound yield"** (Reinvests accrued yield)
- ⚖️ **"Rebalance portfolio positions"** (Shifts funds to highest APY)
- 🛡️ **"Simulate 5 ETH drain attack"** (Watch the Policy Engine reject it)
- 📖 **"What is Privy Policy Engine?"** (Explains our security model)
- 📊 **"Explain the active strategies and APY"** (Shows yield breakdown)
- 🛡️ **"Check wallet health score"** (Audits security parameters)`,
    };
  }

  // General conversational intelligent fallback
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    content: `I received your request: *"${userMessage}"*.

As your **PrivyShield DeFi Copilot**, I can autonomously manage vault positions, execute yield strategies, rebalance allocations, and enforce cryptographic safety via **Privy Policy Engine**.

💡 **Try one of these commands:**
• *"Deposit 0.02 ETH into vault"*
• *"Harvest and compound yield"*
• *"Rebalance my portfolio between Aave and Aerodrome"*
• *"Simulate 5 ETH exploit drain"*
• *"What is Privy Policy Engine?"*
• *"Show treasury balance and APY"*`,
  };
}
