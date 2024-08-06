// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct route {
        address from;
        address to;
        bool stable;
    }

interface IRouter {
    function pairFor(address tokenA, address tokenB, bool stable) external view returns (address pair);
    function WETH() external view returns (address);
    function factory() external view returns (address);
    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        route[] calldata routes,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        route[] calldata routes,
        address to,
        uint deadline
    ) external;
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        route[] calldata routes,
        address to,
        uint deadline
    ) external payable;
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        route[] calldata routes,
        address to,
        uint deadline
    ) external;
}
