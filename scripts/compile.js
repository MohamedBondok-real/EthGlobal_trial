const fs = require('fs');
const path = require('path');
const solc = require('solc');

function compile() {
  console.log('Compiling Solidity contracts...');
  const contractPath = path.join(__dirname, '../contracts/AgentVault.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'AgentVault.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasError = false;
    output.errors.forEach((err) => {
      console.log(err.formattedMessage);
      if (err.severity === 'error') hasError = true;
    });
    if (hasError) {
      console.error('Compilation failed.');
      process.exit(1);
    }
  }

  const contract = output.contracts['AgentVault.sol']['AgentVault'];
  const artifact = {
    contractName: 'AgentVault',
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };

  const outDir = path.join(__dirname, '../src/contracts/artifacts');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outDir, 'AgentVault.json'),
    JSON.stringify(artifact, null, 2)
  );

  console.log('✅ AgentVault.sol successfully compiled and saved to src/contracts/artifacts/AgentVault.json');
}

compile();
