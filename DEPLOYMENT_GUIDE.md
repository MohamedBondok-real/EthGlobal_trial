# 🚀 Deployment Guide: Deploying PrivyShield to Base Sepolia & Vercel

This guide explains how to deploy both the **Solidity Smart Contract** and the **Next.js Fullstack Frontend** to live production.

---

## 1. Deploying the Solidity Smart Contract (`AgentVault.sol`)

### Option A: Via Remix IDE (Easiest & Fastest for Hackathons)
1. Open [Remix Ethereum IDE](https://remix.ethereum.org/).
2. Create a file named `AgentVault.sol` and paste the contents of `contracts/AgentVault.sol`.
3. In the **Solidity Compiler** tab, select compiler version `0.8.20` or higher and click **Compile**.
4. In the **Deploy & Run Transactions** tab:
   - Environment: `Injected Provider - MetaMask` (switch network in MetaMask to **Base Sepolia** or **Arbitrum Sepolia**).
   - Constructor Parameters:
     - `_agentSigner`: `0xF75908b60E8AFBA3E128F6225A10b1d9BABb01Ae` (Your Privy Server Wallet address).
     - `_maxAgentTxLimit`: `50000000000000000` (0.05 ETH in Wei).
   - Click **Deploy** and confirm the transaction.
5. Copy the deployed contract address and update `src/lib/privy.ts` with the new address.

---

## 2. Deploying Next.js Frontend to Vercel

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: PrivyShield AI Agent Wallet with Policy Engine"
   git branch -M main
   git remote add origin https://github.com/<your-username>/privy-agent-shield.git
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Add the following **Environment Variables** in the Vercel project settings:
   - `NEXT_PUBLIC_PRIVY_APP_ID`: `cmtojqa83003h0cjxy26txns2`
   - `PRIVY_APP_ID`: `cmtojqa83003h0cjxy26txns2`
   - `PRIVY_APP_SECRET`: `privy_app_secret_3j2zqmXpeFfAKXeFQXheUHjpCw65sH6s2gPqhT5Gu8W4qPbkjy4uJjWAdtwB88aaVoww738no3Juir4Ba2XptGLR`
   - `RPC_URL`: `https://sepolia.base.org`
5. Click **Deploy**.

---

## 3. Verifying the Hackathon Demo

Once deployed on Vercel:
1. Open the live URL.
2. Click **Privy Social Login** to authenticate.
3. Test autonomous yield execution: Click `🌾 إيداع 0.02 ETH في العائد`.
4. Run the Red-Team Attack Demo: Click `Simulate Jailbreak Drain` to show the judges how the Policy Engine blocks unauthorized high-value drains!
