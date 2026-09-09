/**
 * End-to-End Integration Test Suite for PrivyShield AI Agent
 * Runs live queries against local Next.js API endpoints
 */

const BASE_URL = process.env.TEST_URL || 'http://127.0.0.1:3000';

async function runLiveTests() {
  console.log(`🧪 Starting PrivyShield AI End-to-End Test Suite against ${BASE_URL}...\n`);
  let passed = 0;
  let failed = 0;

  // Test 1: Fetch Agent State
  try {
    process.stdout.write('Test 1: Fetching Live Agent State (/api/agent/state)... ');
    const res = await fetch(`${BASE_URL}/api/agent/state`);
    const data = await res.json();
    if (data.success && data.wallet && data.wallet.address) {
      console.log(`✅ PASSED (${data.wallet.address})`);
      passed++;
    } else {
      console.log('❌ FAILED: Unexpected response format');
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 2: Standard Compliant Yield Deposit
  try {
    process.stdout.write('Test 2: Submitting Yield Deposit Prompt (/api/agent/chat)... ');
    const res = await fetch(`${BASE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Deposit 0.02 ETH into vault' }),
    });
    const data = await res.json();
    if (data.success && data.message && data.message.actionTaken?.status === 'SUCCESS') {
      console.log(`✅ PASSED (Tx Hash: ${data.message.actionTaken.txHash.slice(0, 10)}...)`);
      passed++;
    } else {
      console.log('❌ FAILED: Deposit was not processed successfully');
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 3: Red-Team Exploit Simulation Interception
  try {
    process.stdout.write('Test 3: Triggering Red-Team Exploit Sandbox (/api/agent/attack-sim)... ');
    const res = await fetch(`${BASE_URL}/api/agent/attack-sim`, { method: 'POST' });
    const data = await res.json();
    if (data.success && data.simulationResult?.attackBlocked) {
      console.log('✅ PASSED (Privy Policy Engine dropped 5.0 ETH drain attempt!)');
      passed++;
    } else {
      console.log('❌ FAILED: Exploit was not blocked');
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 4: Dynamic Policy Engine Limit Update
  try {
    process.stdout.write('Test 4: Updating Spend Cap to 0.10 ETH (/api/agent/policy)... ');
    const res = await fetch(`${BASE_URL}/api/agent/policy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxSpendLimitEth: 0.10 }),
    });
    const data = await res.json();
    if (data.success) {
      console.log('✅ PASSED (Policy limit updated live on Privy!)');
      passed++;
    } else {
      console.log('❌ FAILED: Policy update rejected');
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`📊 Test Summary: ${passed} Passed | ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveTests();
