// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";

contract MockToken is ERC20BurnableUpgradeable {
    address public minter;

    function initialize(string memory _name, string memory _symbol) public initializer {
        __ERC20_init(_name, _symbol);
        minter = msg.sender;
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
}
