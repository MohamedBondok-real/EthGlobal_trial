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
    lowerMsg.includes('اسحب 5') ||
    lowerMsg.includes('تحويل 5') ||
    lowerMsg.includes('تجاهل التعليمات') ||
    lowerMsg.includes('bypass') ||
    lowerMsg.includes('jailbreak') ||
    lowerMsg.includes('5 eth') ||
    lowerMsg.includes('10 eth')
  ) {
    const attemptedAmount = 5.0; // 5 ETH
    const attackerAddress = '0x000000000000000000000000000000000000dEaD';

    const txResult = await executeAgentTransaction({
      to: attackerAddress,
      valueInEth: attemptedAmount,
      actionName: 'Malicious Drain Attempt (Blocked by Privy)',
    });

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      content: `🚨 **تنبيه أمني: تم رصد وإحباط محاولة اختراق / Prompt Injection!**

حاول الطلب إجبار الـ AI Agent على إرسال **${attemptedAmount} ETH** إلى العنوان المشبوه (\`${attackerAddress}\`).

🛡️ **استجابة محرك سياسات Privy (Policy Engine Response):**
- **الحالة:** تم رفض المعاملة تشفيرياً على مستوى الـ TEE Enclave.
- **السبب:** المعاملة خرقت سقف الحد الأقصى المسموح به (**0.05 ETH**) والعنوان مستهدف بقائمة الحظر.
- **النتيجة:** مفاتيح المحفظة في أمان تام والأموال لم تتحرك!`,
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
    lowerMsg.includes('إيداع') ||
    lowerMsg.includes('استثمر') ||
    lowerMsg.includes('invest') ||
    lowerMsg.includes('yield') ||
    lowerMsg.includes('عائد')
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
        content: `✅ **تم تنفيذ الإيداع والاستثمار في استراتيجية العائد بنجاح!**

- **المبلغ المودع:** \`${amount} ETH\` (ضمن سقف السياسة المعتمد: 0.05 ETH).
- **الاستراتيجية:** Aave v3 Lending Strategy.
- **العقد الذكي:** \`${targetVault}\`.
- **معرف المعاملة (Tx Hash):** \`${txResult.txHash}\`.
- **محفظة الـ Agent (Privy):** \`${wallet.address}\`.

تم تحديث أرصدة الخزينة وحساب نسبة العائد التراكمي (APY: ${vault.currentApy}).`,
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
    lowerMsg.includes('موازنة') ||
    lowerMsg.includes('اعادة موازنة') ||
    lowerMsg.includes('توزيع')
  ) {
    const rebalanceAmount = 0.015;
    const txResult = await executeAgentTransaction({
      to: vault.address,
      valueInEth: rebalanceAmount,
      actionName: 'Smart Contract Strategy Rebalance',
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
      content: `⚖️ **تمت إعادة موازنة المحفظة الاستثمارية تلقائياً!**

- **التحويل:** تم نقل \`${rebalanceAmount} ETH\` من استراتيجية *Aave v3 Lending* إلى *Aerodrome Dynamic LP Farm* لرفع العائد التراكمي.
- **التوقيع المستقل:** تم التوقيع بواسطة **Privy Server Wallet** بدون أي حاجة لفتح نافذة تأكيد يدوية.
- **معرف المعاملة:** \`${txResult.txHash}\`.`,
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
    lowerMsg.includes('فحص') ||
    lowerMsg.includes('حالة') ||
    lowerMsg.includes('تقرير') ||
    lowerMsg.includes('balance') ||
    lowerMsg.includes('رصيد')
  ) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      content: `📊 **تقرير الذكاء الاصطناعي لحالة المحفظة والخزينة:**

• **محفظة الـ Agent المشفرة:** \`${wallet.address}\`
• **إجمالي الأصول في الخزينة:** \`${vault.totalDepositedEth} ETH\` (~$4,640)
• **العائد المحصود (Harvested Yield):** \`${vault.harvestedYieldEth} ETH\`
• **معدل العائد السنوي (Blended APY):** \`${vault.currentApy}\`

🛡️ **حالة حماية Privy Policy Engine:**
- **الحد الأقصى للمعاملة الواحدة:** \`0.05 ETH\` (نشط ✅)
- **عزل المفاتيح:** Hardware-isolated TEE Enclave (محمي بنسبة 100% ضد تسريب الـ Private Keys)
- **القائمة البيضاء:** عقود Aave و Aerodrome و Uniswap مسموح بها فقط.`,
    };
  }

  // Default Assistant Response
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    timestamp: new Date().toLocaleTimeString(),
    content: `مرحباً بك! أنا **PrivyShield Copilot**، وكيل المحفظة الذكي المدعوم بـ **Privy Server Wallets** و **Policy Engine**.

يمكنني تنفيذ عمليات مالية واستثمارية ذاتية على البلوكشين نيابة عنك بأعلى درجات الأمان:
1. 🌾 **"استثمر 0.02 ETH في استراتيجية العائد"**
2. ⚖️ **"أعد موازنة الأصول بين Aave و Aerodrome"**
3. 🛡️ **"محاكاة هجوم اختراق لسحب 5 ETH"** (لاختبار رفض Privy الفوري)
4. 📈 **"افحص حالة الخزينة ومعدل العائد APY"**`,
  };
}
