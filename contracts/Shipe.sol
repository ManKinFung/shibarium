// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./interfaces/IRouter.sol";
import "./interfaces/IPairFactory.sol";

contract Shipe is ERC20BurnableUpgradeable, OwnableUpgradeable {
    address public minter;

    IRouter public router;

    bool private swapping;
    bool public swapEnabled;
    bool public tradingEnabled;
    uint256 private launchTimestamp;

    address public treasuryWallet;

    uint256 public swapTokensAtAmount;
    uint256 public buyTax;
    uint256 public sellTax;
    uint256[] private taxTimestampSteps;
    uint256[] private buyTaxSteps;
    uint256[] private sellTaxSteps;

    mapping(address => bool) public blacklisted;
    mapping(address => bool) public isExcludedFromFees;
    mapping(address => bool) public automatedMarketMakerPairs;

    event ExcludeFromFees(address indexed account, bool isExcluded);
    event SetAutomatedMarketMakerPair(address indexed pair, bool indexed value);

    function initialize(address _router, address _treasury) public initializer {
        __Ownable_init();
        __ERC20_init("Shipe", "$SHIP");

        minter = msg.sender;

        swapEnabled = true;

        router = IRouter(_router);
        treasuryWallet = _treasury;

        excludeFromFees(owner(), true);
        excludeFromFees(address(this), true);

        taxTimestampSteps.push(1 minutes);
        taxTimestampSteps.push(5 minutes);
        taxTimestampSteps.push(3 minutes);

        buyTaxSteps.push(3000);
        buyTaxSteps.push(1500);
        buyTaxSteps.push(500);

        sellTaxSteps.push(3000);
        sellTaxSteps.push(1500);
        sellTaxSteps.push(500);

        buyTax = 300;
        sellTax = 300;
    }

    function setMinter(address _minter) external {
        require(msg.sender == minter);
        minter = _minter;
    }

    function mint(address account, uint256 amount) external returns (bool) {
        require(msg.sender == minter, "not allowed");
        _mint(account, amount);
        return true;
    }

    function setSwapEnabled(bool _enabled) external onlyOwner {
        swapEnabled = _enabled;
    }

    function enableTrading(bool _enable) external onlyOwner {
        require(tradingEnabled != _enable && launchTimestamp > 0, "Already Set");
        tradingEnabled = _enable;
    }

    function launch() external onlyOwner {
        launchTimestamp = block.timestamp;
        tradingEnabled = true;
    }

    /// @dev Set new pairs created due to listing in new DEX
    function setAutomatedMarketMakerPair(address newPair, bool value)
        external
        onlyOwner
    {
        _setAutomatedMarketMakerPair(newPair, value);
    }

    function _setAutomatedMarketMakerPair(address newPair, bool value) private {
        require(
            automatedMarketMakerPairs[newPair] != value,
            "Automated market maker pair is already set to that value"
        );
        automatedMarketMakerPairs[newPair] = value;

        emit SetAutomatedMarketMakerPair(newPair, value);
    }

    function setTreasuryWallet(address newWallet) public onlyOwner {
        treasuryWallet = newWallet;
    }

    function setSwapTokensAtAmount(uint256 amount) public onlyOwner {
        swapTokensAtAmount = amount * 10**18;
    }

    function setBuyTax(uint256 _tax) external onlyOwner {
        require(_tax <= 2000, "Fee must be <= 20%");
        buyTax = _tax;
    }

    function setSellTax(uint256 _tax) external onlyOwner {
        require(_tax <= 2000, "Fee must be <= 20%");
        sellTax = _tax;
    }

    function setTaxSteps(uint256[] calldata _timestamps, uint256[] calldata _buyTaxes, uint256[] calldata _sellTaxes) external onlyOwner {
        taxTimestampSteps = _timestamps;
        buyTaxSteps = _buyTaxes;
        sellTaxSteps = _sellTaxes;
    }

    function blacklist(address user, bool value) external onlyOwner {
        require(blacklisted[user] != value, "Already Set");
        blacklisted[user] = value;
    }

    function excludeFromFees(address account, bool excluded) public onlyOwner {
        require(
            isExcludedFromFees[account] != excluded,
            "Account is already the value of 'excluded'"
        );
        isExcludedFromFees[account] = excluded;

        emit ExcludeFromFees(account, excluded);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        require(!blacklisted[from] && !blacklisted[to], "Blacklisted");

        if (
            !isExcludedFromFees[from] && !isExcludedFromFees[to] && !swapping
        ) {
            require(tradingEnabled, "Trading not active");
        }

        if (amount == 0) {
            super._transfer(from, to, 0);
            return;
        }

        uint256 contractTokenBalance = balanceOf(address(this));
        bool canSwap = contractTokenBalance >= swapTokensAtAmount && contractTokenBalance > 0;

        if (
            canSwap &&
            !swapping &&
            swapEnabled &&
            automatedMarketMakerPairs[to] &&
            !isExcludedFromFees[from] &&
            !isExcludedFromFees[to]
        ) {
            swapping = true;

            if (sellTax > 0) {
                swapToTreasury(swapTokensAtAmount);
            }

            swapping = false;
        }

        bool takeFee = !swapping;

        // if any account belongs to _isExcludedFromFee account then remove the fee
        if (isExcludedFromFees[from] || isExcludedFromFees[to]) {
            takeFee = false;
        }

        if (!automatedMarketMakerPairs[to] && !automatedMarketMakerPairs[from])
            takeFee = false;

        if (takeFee) {
            uint256 feeAmt;
            if (automatedMarketMakerPairs[to])
                feeAmt = (amount * getSellTax()) / 10000;
            else if (automatedMarketMakerPairs[from])
                feeAmt = (amount * getBuyTax()) / 10000;

            amount = amount - feeAmt;
            super._transfer(from, address(this), feeAmt);
        }
        super._transfer(from, to, amount);
    }

    function swapToTreasury(uint256 tokens) private {
        swapTokensForETH(tokens);

        uint256 EthTaxBalance = address(this).balance;

        // Send ETH to treasury
        uint256 trAmt = EthTaxBalance;

        if (trAmt > 0) {
            (bool success, ) = payable(treasuryWallet).call{value: trAmt}("");
            require(success, "Failed to send ETH to treasury wallet");
        }
    }

    function swapTokensForETH(uint256 tokenAmount) private {
        route[] memory routes = new route[](1);
        routes[0].from = address(this);
        routes[0].to = router.WETH();
        routes[0].stable = false;

        _approve(address(this), address(router), tokenAmount);

        // make the swap
        router.swapExactTokensForETH(
            tokenAmount,
            0, // accept any amount of ETH
            routes,
            address(this),
            block.timestamp
        );
    }

    function getSellTax() internal view returns (uint256) {
        uint256 curTick = block.timestamp;
        uint256 i;
        uint256 tick = launchTimestamp;
        for (i = 0; i < taxTimestampSteps.length; i ++) {
            if (curTick <= tick + taxTimestampSteps[i]) return sellTaxSteps[i];
            tick += taxTimestampSteps[i];
        }
        return sellTax;
    }

    function getBuyTax() internal view returns (uint256) {
        uint256 curTick = block.timestamp;
        uint256 i;
        uint256 tick = launchTimestamp;
        for (i = 0; i < taxTimestampSteps.length; i ++) {
            if (curTick <= tick + taxTimestampSteps[i]) return buyTaxSteps[i];
            tick += taxTimestampSteps[i];
        }
        return buyTax;
    }

    receive() external payable {}
}
