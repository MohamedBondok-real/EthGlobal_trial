// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentVault
 * @notice An autonomous DeFi vault managed by a Privy AI Agent Server Wallet.
 * @dev Enforces on-chain guardrails in addition to Privy's Policy Engine.
 */
contract AgentVault {
    // --- State Variables ---
    address public owner;
    address public agentSigner; // Privy Server Wallet address
    bool public paused;

    uint256 public totalDeposited;
    uint256 public totalYieldHarvested;
    uint256 public maxAgentTxLimit; // e.g. 0.1 ETH
    uint256 public constant PROTOCOL_FEE_BPS = 50; // 0.5%

    struct Strategy {
        string name;
        address targetContract;
        uint256 allocatedCapital;
        uint256 targetWeightBps; // e.g. 5000 = 50%
        bool isActive;
    }

    mapping(uint256 => Strategy) public strategies;
    uint256 public strategyCount;

    mapping(address => uint256) public userBalances;

    // --- Events ---
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event StrategyAdded(uint256 indexed strategyId, string name, address targetContract);
    event StrategyExecuted(uint256 indexed strategyId, uint256 amount, string action);
    event YieldHarvested(uint256 amount, uint256 timestamp);
    event AgentUpdated(address indexed previousAgent, address indexed newAgent);
    event EmergencyPauseToggled(bool isPaused);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyAgentOrOwner() {
        require(msg.sender == agentSigner || msg.sender == owner, "Unauthorized: Only Privy Agent or Owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Vault is paused");
        _;
    }

    constructor(address _agentSigner, uint256 _maxAgentTxLimit) {
        owner = msg.sender;
        agentSigner = _agentSigner;
        maxAgentTxLimit = _maxAgentTxLimit;
        paused = false;

        // Initialize default mock strategies (e.g., Aave Lending & Aerodrome Liquidity)
        _addStrategy("Aave v3 USDC Yield", address(0x1111111111111111111111111111111111111111), 6000);
        _addStrategy("Aerodrome LP Farming", address(0x2222222222222222222222222222222222222222), 4000);
    }

    // --- User Actions ---
    receive() external payable {
        deposit();
    }

    function deposit() public payable whenNotPaused {
        require(msg.value > 0, "Deposit must be > 0");
        userBalances[msg.sender] += msg.value;
        totalDeposited += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external whenNotPaused {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        userBalances[msg.sender] -= amount;
        totalDeposited -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    // --- Autonomous Agent Actions ---
    function executeStrategy(
        uint256 strategyId,
        uint256 amount,
        string calldata action
    ) external onlyAgentOrOwner whenNotPaused {
        require(strategyId < strategyCount, "Invalid strategy ID");
        require(strategies[strategyId].isActive, "Strategy is not active");
        require(amount <= maxAgentTxLimit, "Exceeds on-chain Agent TX limit");
        require(address(this).balance >= amount, "Insufficient vault balance");

        strategies[strategyId].allocatedCapital += amount;
        emit StrategyExecuted(strategyId, amount, action);
    }

    function harvestYield(uint256 simulatedYieldAmount) external onlyAgentOrOwner whenNotPaused {
        require(simulatedYieldAmount > 0, "Yield must be > 0");
        totalYieldHarvested += simulatedYieldAmount;
        emit YieldHarvested(simulatedYieldAmount, block.timestamp);
    }

    function rebalance(
        uint256 fromStrategyId,
        uint256 toStrategyId,
        uint256 amount
    ) external onlyAgentOrOwner whenNotPaused {
        require(fromStrategyId < strategyCount && toStrategyId < strategyCount, "Invalid strategy");
        require(strategies[fromStrategyId].allocatedCapital >= amount, "Not enough in source strategy");

        strategies[fromStrategyId].allocatedCapital -= amount;
        strategies[toStrategyId].allocatedCapital += amount;

        emit StrategyExecuted(toStrategyId, amount, "REBALANCE");
    }

    // --- Admin / Management ---
    function _addStrategy(string memory name, address targetContract, uint256 targetWeightBps) internal {
        strategies[strategyCount] = Strategy({
            name: name,
            targetContract: targetContract,
            allocatedCapital: 0,
            targetWeightBps: targetWeightBps,
            isActive: true
        });
        emit StrategyAdded(strategyCount, name, targetContract);
        strategyCount++;
    }

    function setAgentSigner(address _newAgent) external onlyOwner {
        emit AgentUpdated(agentSigner, _newAgent);
        agentSigner = _newAgent;
    }

    function setMaxAgentTxLimit(uint256 _newLimit) external onlyOwner {
        maxAgentTxLimit = _newLimit;
    }

    function togglePause() external onlyOwner {
        paused = !paused;
        emit EmergencyPauseToggled(paused);
    }

    function getVaultDetails() external view returns (
        uint256 balance,
        uint256 deposited,
        uint256 harvested,
        uint256 maxTxLimit,
        bool isPaused,
        address agent
    ) {
        return (
            address(this).balance,
            totalDeposited,
            totalYieldHarvested,
            maxAgentTxLimit,
            paused,
            agentSigner
        );
    }
}
