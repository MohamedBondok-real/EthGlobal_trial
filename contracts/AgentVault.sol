// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentVault
 * @author Mohamed Bondok & Team
 * @notice Simple multi-strategy yield vault with delegated AI agent execution.
 * Designed to work alongside Privy Server Wallets & Policy Engine guardrails.
 */
contract AgentVault {
    address public immutable owner;
    address public agentSigner;
    bool public isPaused;

    uint256 public totalDeposited;
    uint256 public totalHarvested;
    uint256 public maxAgentTxLimit;

    struct Strategy {
        string name;
        address targetContract;
        uint256 allocatedCapital;
        uint256 weightBps; // Base points (10,000 = 100%)
        bool active;
    }

    mapping(uint256 => Strategy) public strategies;
    uint256 public strategyCount;
    mapping(address => uint256) public balances;

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed sender, uint256 amount);
    event StrategyExecuted(uint256 indexed strategyId, uint256 amount, string action);
    event YieldCompounded(uint256 amount, uint256 timestamp);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);
    event PauseToggled(bool paused);

    modifier onlyOwner() {
        require(msg.sender == owner, "AgentVault: caller is not owner");
        _;
    }

    modifier onlyAgentOrOwner() {
        require(
            msg.sender == agentSigner || msg.sender == owner,
            "AgentVault: unauthorized signer"
        );
        _;
    }

    modifier whenNotPaused() {
        require(!isPaused, "AgentVault: vault currently paused");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Default agent signer provisioned via Privy Server Wallets
        agentSigner = 0xF75908b60E8AFBA3E128F6225A10b1d9BABb01Ae;
        maxAgentTxLimit = 0.05 ether;
        isPaused = false;

        _registerStrategy("Aave v3 Lending Pool", 0x1111111111111111111111111111111111111111, 6000);
        _registerStrategy("Aerodrome Volatile LP", 0x2222222222222222222222222222222222222222, 4000);
    }

    receive() external payable {
        deposit();
    }

    function deposit() public payable whenNotPaused {
        require(msg.value > 0, "AgentVault: zero deposit amount");
        balances[msg.sender] += msg.value;
        totalDeposited += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external whenNotPaused {
        require(balances[msg.sender] >= amount, "AgentVault: insufficient balance");
        balances[msg.sender] -= amount;
        totalDeposited -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "AgentVault: transfer failed");

        emit Withdraw(msg.sender, amount);
    }

    function executeStrategy(
        uint256 strategyId,
        uint256 amount,
        string calldata action
    ) external onlyAgentOrOwner whenNotPaused {
        require(strategyId < strategyCount, "AgentVault: strategy does not exist");
        require(strategies[strategyId].active, "AgentVault: strategy is disabled");
        require(amount <= maxAgentTxLimit, "AgentVault: tx limit exceeded");
        require(address(this).balance >= amount, "AgentVault: vault balance too low");

        strategies[strategyId].allocatedCapital += amount;
        emit StrategyExecuted(strategyId, amount, action);
    }

    function harvestYield(uint256 amount) external onlyAgentOrOwner whenNotPaused {
        require(amount > 0, "AgentVault: zero yield amount");
        totalHarvested += amount;
        emit YieldCompounded(amount, block.timestamp);
    }

    function rebalance(
        uint256 fromId,
        uint256 toId,
        uint256 amount
    ) external onlyAgentOrOwner whenNotPaused {
        require(fromId < strategyCount && toId < strategyCount, "AgentVault: invalid strategy ids");
        require(strategies[fromId].allocatedCapital >= amount, "AgentVault: insufficient strategy funds");

        strategies[fromId].allocatedCapital -= amount;
        strategies[toId].allocatedCapital += amount;

        emit StrategyExecuted(toId, amount, "REBALANCE");
    }

    function _registerStrategy(
        string memory name,
        address targetContract,
        uint256 weightBps
    ) internal {
        strategies[strategyCount] = Strategy({
            name: name,
            targetContract: targetContract,
            allocatedCapital: 0,
            weightBps: weightBps,
            active: true
        });
        strategyCount++;
    }

    function setAgentSigner(address newAgent) external onlyOwner {
        require(newAgent != address(0), "AgentVault: zero address");
        emit AgentUpdated(agentSigner, newAgent);
        agentSigner = newAgent;
    }

    function setMaxAgentTxLimit(uint256 newLimit) external onlyOwner {
        maxAgentTxLimit = newLimit;
    }

    function togglePause() external onlyOwner {
        isPaused = !isPaused;
        emit PauseToggled(isPaused);
    }

    function getVaultSummary() external view returns (
        uint256 balance,
        uint256 deposited,
        uint256 harvested,
        uint256 txLimit,
        bool pausedState,
        address currentAgent
    ) {
        return (
            address(this).balance,
            totalDeposited,
            totalHarvested,
            maxAgentTxLimit,
            isPaused,
            agentSigner
        );
    }
}
