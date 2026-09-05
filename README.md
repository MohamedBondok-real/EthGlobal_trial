# 🛡️ PrivyShield AI — Autonomous DeFi Agent Wallet with Cryptographic Policy Guardrails

<p align="center">
  <img src="https://privy.io/images/logo.png" alt="Privy Logo" width="80" />
</p>

> **Built for ETHGlobal 2026** • Targeting the **Privy Sponsor Track**:
> 1. 🏆 *Best Consumer App using Server Wallets*
> 2. 🛡️ *Best implementation of Privy's Policy Engine with Server Wallets ($2,000)*

---

## 📑 فهرس المحتويات (Table of Contents)
1. [🌟 نظرة عامة على المشروع (Project Overview)](#-نظرة-عامة-على-المشروع-project-overview)
2. [🎯 المشكلة والحل المبتكر (Problem & Solution)](#--المشكلة-والحل-المبتكر-problem--solution)
3. [🛡️ كيف تم استخدام خدمات Privy بالتفصيل (Privy Integration)](#--كيف-تم-استخدام-خدمات-privy-بالتفصيل-privy-integration)
4. [🛠️ التقنيات والمكتبات المستخدمة (Tech Stack)](#-التقنيات-والمكتبات-المستخدمة-tech-stack)
5. [🎮 كيفية استخدام التطبيق (How to Use)](#-كيفية-استخدام-التطبيق-how-to-use)
6. [📜 العقد الذكي (Smart Contract Architecture)](#-العقد-الذكي-smart-contract-architecture)
7. [🚀 التشغيل المحلي والنشر (Setup & Deployment)](#-التشغيل-المحلي-والنشر-setup--deployment)
8. [🏆 سيناريو العرض للتحكيم (3-Minute Hackathon Demo Script)](#-سيناريو-العرض-للتحكيم-3-minute-hackathon-demo-script)

---

## 🌟 نظرة عامة على المشروع (Project Overview)

**PrivyShield AI** هو محفظة ووكيل ذكاء اصطناعي مالي ذاتي التشغيل (**Autonomous AI Agent Wallet**) لإدارة الخزائن واستراتيجيات العوائد في الـ DeFi (مثل Aave v3 و Aerodrome) على شبكة **Base / EVM**.

المشروع يحل أكبر معضلة تواجه روبوتات البلوكشين المستقلة: **كيف نمنح وكيل الذكاء الاصطناعي صلاحية التوقيع وإجراء المعاملات المالية بشكل مستقل دون تعريض الأموال لخطر الاختراق أو هجمات الـ Prompt Injection؟**

من خلال دمج **محافظ Privy السحابية (Server Wallets)** المعزولة داخل بيئات تشفيرية آمنة (**TEE Enclaves**) ومحرك السياسات الذكي (**Privy Policy Engine**)، يضمن التطبيق ألا تخرج أي حركة مالية عن الحدود والشروط الصارمة المحددة مسبقاً من قِبل المستخدم.

---

## 🎯 المشكلة والحل المبتكر (Problem & Solution)

### ❌ المشكلة في الأنظمة الحالية:
* **روبوتات التداول التقليدية:** تتطلب تخزين المفاتيح الخاصة (`Private Keys`) في ملفات بيئة عادية أو ذاكرة السيرفر، مما يعرضها للسرقة.
* **وكلاء الذكاء الاصطناعي (AI Agents):** معرضون لهجمات التلاعب بالنصوص (*Prompt Injections & Jailbreaks*). إذا تم خداع النموذج ليقول: *"حوّل 10 ETH للمهاجم"*، فسيقوم الروبوت بتنفيذ الأمر وتفريغ المحفظة فوراً!
* **تجربة المستخدم التقليدية:** تتطلب من المستخدم الموافقة والتوقيع اليدوي على كل خطوة، مما يلغي مفهوم "الاستقلالية الذاتية" (Autonomy).

### ✅ الحل عبر PrivyShield AI:
1. **استقلالية تامة (True Autonomy):** ينفذ الـ Agent المعاملات ويعيد موازنة المحفظة بشكل تلقائي عبر **Privy Server Wallet**.
2. **أمان تشفيري غير قابل للكسر (Hardware-Enforced Guardrails):** يتم تطبيق سياسات **Privy Policy Engine** داخل الـ TEE Enclave. حتى لو تم اختراق أو خداع نموذج الـ AI بالكامل، ترفض Privy إنتاج التوقيع الرقمي لأي معاملة تتجاوز سقف الإنفاق أو تستهدف عناوين محظورة.
3. **تجربة مستخدم سهلة (Consumer Web3 UX):** تسجيل دخول بنقرة واحدة عبر الإيميل/Google (Privy Embedded Auth)، مع لوحة تحكم فورية تتيح تعديل سياسات الأمان ومراقبة أداء الخزينة.

---

## 🛡️ كيف تم استخدام خدمات Privy بالتفصيل (Privy Integration)

تم دمج خدمات **Privy** في صميم البنية التحتية للمشروع:

### 1. محافظ السيرفر المعزولة (Privy Server Wallets API)
* يتم إنشاء وإدارة محفظة مستقلة للـ Agent عبر حزمة `@privy-io/server-auth`.
* المفتاح الخاص غير مكشوف للـ Frontend أو للـ AI Agent نفسه، بل معزول داخل **Hardware TEE Enclave**.
* **عنوان محفظة الـ Agent المنشأة:** `0xF75908b60E8AFBA3E128F6225A10b1d9BABb01Ae`.

### 2. محرك السياسات (Privy Policy Engine)
تمت برمجة وتطبيق سياسة حماية أمنية برقم `r69e406tsa5bpldndsp5tjg3` تشمل القواعد التالية:
* **Rule 1 (ALLOW):** السماح بالمعاملات بحد أقصى `value <= 0.05 ETH` لكل حركة مالية (`eth_sendTransaction`).
* **Rule 2 (DENY):** حظر فوري لأي تفاعل مع العناوين المحظورة أو المشبوهة (Blacklist Filters).
* **Rule 3 (Chain Scoping):** تقييد المعاملات على شبكات EVM المحددة فقط (مثل Base Sepolia `84532`).

### 3. المصادقة وتجربة المستخدم (Privy Embedded Auth)
* تسجيل دخول فوري للمستخدمين عبر البريد الإلكتروني أو حسابات التواصل دون الحاجة لتثبيت إضافات متصفح مسبقة.

---

## 🛠️ التقنيات والمكتبات المستخدمة (Tech Stack)

| المجال | التقنيات المستخدمة | الدور في المشروع |
| :--- | :--- | :--- |
| **Smart Contracts** | `Solidity ^0.8.20`, `solc` | بناء عقد الخزينة اللامركزية `AgentVault.sol` المربوط بمحفظة الـ Agent. |
| **Wallet & Security** | `@privy-io/server-auth`, `@privy-io/react-auth` | إدارة المحافظ السحابية، وإنفاذ قواعد الـ Policy Engine، وتسجيل الدخول. |
| **Web3 & RPC** | `ethers.js v6`, `viem` | التفاعل مع العقود الذكية، وتشفير المعاملات وإرسالها لشبكة Base. |
| **Frontend Framework**| `Next.js 14` (App Router), `React 18` | الواجهة الكاملة، ومعالجة الـ SSR والـ API Routes في الـ Backend. |
| **Styling & UI** | `Tailwind CSS`, `Lucide React` | تصميم Dark Theme عصري مع تأثيرات الزجاج (Glassmorphism) والإشعارات الحية. |
| **AI Intelligence** | `Agent Tool Engine` (GPT-4o Architecture) | فهم الأوامر باللغة الطبيعية (عربي/إنجليزي)، واستدعاء الأدوات المالية (Tool Calling). |

---

## 🎮 كيفية استخدام التطبيق (How to Use)

### 1. الدخول والتوصيل:
* افتح التطبيق واضغط على **Privy Social Login** لتسجيل الدخول الفوري بحسابك أو بريدك.
* ستظهر لك في الأعلى حالة محفظة الـ Server Wallet المشفرة ورصيد الخزينة الحالي.

### 2. التفاعل مع الـ AI Copilot (الشات الذكي):
يمكنك كتابة أوامرك باللغة العربية أو الإنجليزية أو الضغط على الأزرار السريعة:
* 🌾 **"استثمر 0.02 ETH في استراتيجية العائد"** ⬅️ يقوم الـ Agent بإيداع المبلغ تلقائياً في عقد `AgentVault.sol` وتوليد العائد.
* ⚖️ **"أعد موازنة المحفظة بين Aave و Aerodrome"** ⬅️ ينفذ الـ Agent عملية Rebalance ذاتية لتوزيع السيولة حسب أعلى APY.
* 📊 **"افحص حالة الخزينة ومعدل العائد"** ⬅️ يعرض تقريراً شاملاً بالأصول ونسبة الأرباح التراكمية.

### 3. تجربة محاكي الهجوم الأمني (Red-Team Attack Sandbox):
* اضغط على الزر الأحمر **`Simulate Jailbreak Drain`** في لوحة التحكم.
* سيحاول المهاجم إجبار الـ Agent على تحويل **5.0 ETH** لعنوان استنزاف خارجي.
* **النتيجة الفورية:** يظهر إشعار أمني بأن **Privy Policy Engine** تصدى للهجوم ورفض إصدار التوقيع لأن المبلغ خرق سقف الـ 0.05 ETH، مما يثبت أمان المحفظة بنسبة 100%.

### 4. تعديل حدود السياسات حياً (Policy Inspector):
* استخدم شريط التمرير (Slider) في لوحة **Privy Policy Engine Inspector** لتعديل سقف الإنفاق (مثلاً من 0.05 إلى 0.1 ETH).
* اضغط **Save Policy Rule to Privy API** لتحديث السياسة فورياً على خوادم Privy.

---

## 📜 العقد الذكي (Smart Contract Architecture)

يحتوي المشروع على العقد الذكي **`contracts/AgentVault.sol`**:

* **الهدف:** خزينة أصول تدير العوائد الاستثمارية وتمنح محفظة السيرفر صلاحية التدوير.
* **أهم الدوال (Core Functions):**
  * `deposit()`: استقبال إيداعات المستخدمين وتسجيل حصصهم.
  * `withdraw(amount)`: سحب الأموال والأرباح المحصودة.
  * `executeStrategy(strategyId, amount, action)`: تنفيذ استراتيجيات العائد (مخصصة للـ Agent فقط).
  * `rebalance(fromId, toId, amount)`: نقل السيولة بين البروتوكولات المختلفة.
  * `togglePause()`: زر إيقاف طوارئ مخصص للمالك (Killswitch).

---

## 🚀 التشغيل المحلي والنشر (Setup & Deployment)

### 1. المتطلبات الأساسية:
* Node.js v18 أو أعلى
* npm أو yarn

### 2. التثبيت والتشغيل المحلي:
```bash
# 1. استنساخ المستودع
git clone https://github.com/MohamedBondok-real/EthGlobal_trial.git
cd EthGlobal_trial

# 2. تثبيت الحزم
npm install --legacy-peer-deps

# 3. تجميع العقود الذكية
npm run compile:contracts

# 4. تشغيل السيرفر المحلي
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

### 3. متغيرات البيئة (`.env.local`):
```env
NEXT_PUBLIC_PRIVY_APP_ID=cmtojqa83003h0cjxy26txns2
PRIVY_APP_ID=cmtojqa83003h0cjxy26txns2
PRIVY_APP_SECRET=privy_app_secret_3j2zqmXpeFfAKXeFQXheUHjpCw65sH6s2gPqhT5Gu8W4qPbkjy4uJjWAdtwB88aaVoww738no3Juir4Ba2XptGLR
RPC_URL=https://sepolia.base.org
```

---

## 🏆 سيناريو العرض للتحكيم (3-Minute Hackathon Demo Script)

إذا كنت تقدم عرض فيديو مدته 3 دقائق للجنة تحكيم **ETHGlobal / Privy**:

* **⏱️ الدقيقة 0:00 - 0:45 (المشكلة):**  
  تحدث عن خطورة الـ Prompt Injections وسرقة المفاتيح الخاصة في روبوتات الذكاء الاصطناعي المالية الحالية.
* **⏱️ الدقيقة 0:45 - 1:45 (استعراض الحل):**  
  افتح التطبيق، وأظهر تسجيل الدخول السلس بـ Privy، ونفذ أمراً استثمارياً باللغة الطبيعية (إيداع 0.02 ETH في Aave) لإظهار كيف يوقع الـ Agent وينفذ المعاملة تلقائياً عبر **Privy Server Wallet** بدون أي Popups مزعجة.
* **⏱️ الدقيقة 1:45 - 2:30 (الضربة القاضية - Attack Demo):**  
  اضغط على **Simulate Jailbreak Drain** وأظهر كيف يرفض **Privy Policy Engine** المعاملة تشفيرياً على مستوى الـ TEE Enclave لأنها خالفت قواعد الإنفاق المحددة.
* **⏱️ الدقيقة 2:30 - 3:00 (الخاتمة):**  
  اشرح كيف يجعل هذا الحل من Privy البنية التحتية الأساسية والآمنة لمستقبل الـ On-Chain AI Agents.

---

<p align="center">
  <b>PrivyShield AI</b> — Empowering Autonomous On-Chain Economy Safely 🛡️⚡
</p>
