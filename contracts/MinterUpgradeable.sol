// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.13;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/MathUpgradeable.sol";

import "./interfaces/IMinter.sol";
import "./interfaces/IRewardsDistributor.sol";
import "./interfaces/IShipe.sol";
import "./interfaces/IVoter.sol";
import "./interfaces/IVotingEscrow.sol";
import "./Epoch.sol";

// codifies the minting rules as per ve(3,3), abstracted from the token to support any token that allows minting
contract MinterUpgradeable is IMinter, OwnableUpgradeable {
    uint256 public constant PRECISION = 1e3;
    uint256 public constant LOCK = EPOCH_DURATION * 52 * 2; // 2 years
    uint256 public constant MAX_TEAM_RATE = 0.05e3; // 5%

    bool public isFirstMint;

    uint256 public EMISSION;
    uint256 public TAIL_EMISSION;
    uint256 public REBASEMAX;
    uint256 public REBASESLOPE;
    uint256 public teamRate;

    uint256 public weekly;
    uint256 public active_period;

    address internal _initializer;
    address public team;
    address public pendingTeam;

    IShipe public _shipe;
    IVoter public _voter;
    IVotingEscrow public _ve;
    IRewardsDistributor public _rewards_distributor;

    event Mint(address indexed sender, uint256 weekly, uint256 circulating_supply, uint256 circulating_emission);

    constructor() {}

    function initialize(
        address __voter, // the voting & distribution system
        address __ve, // the ve(3,3) system that will be locked into
        address __rewards_distributor // the distribution system that ensures users aren't diluted
    ) public initializer {
        __Ownable_init();

        _initializer = msg.sender;
        team = msg.sender;

        teamRate = 25;

        EMISSION = 990;
        TAIL_EMISSION = 2;
        REBASEMAX = 500;
        REBASESLOPE = 625;

        _shipe = IShipe(IVotingEscrow(__ve).token());
        _voter = IVoter(__voter);
        _ve = IVotingEscrow(__ve);
        _rewards_distributor = IRewardsDistributor(__rewards_distributor);

        active_period = ((block.timestamp + (2 * EPOCH_DURATION)) / EPOCH_DURATION) * EPOCH_DURATION;
        weekly = 2_600_000 * 1e18; // represents a starting weekly emission of 2.6M SHIPE
        isFirstMint = true;
    }

    function _initialize() external {
        require(_initializer == msg.sender);
        _initializer = address(0);
        active_period = ((block.timestamp) / EPOCH_DURATION) * EPOCH_DURATION; // allow minter.update_period() to mint new emissions THIS Thursday
    }

    function setTeam(address _team) external {
        require(msg.sender == team, "not team");
        pendingTeam = _team;
    }

    function acceptTeam() external {
        require(msg.sender == pendingTeam, "not pending team");
        team = pendingTeam;
    }

    function setVoter(address __voter) external {
        require(__voter != address(0));
        require(msg.sender == team, "not team");
        _voter = IVoter(__voter);
    }

    function setTeamRate(uint256 _teamRate) external {
        require(msg.sender == team, "not team");
        require(_teamRate <= MAX_TEAM_RATE, "rate too high");
        teamRate = _teamRate;
    }

    function setEmission(uint256 _emission) external {
        require(msg.sender == team, "not team");
        require(_emission <= PRECISION, "rate too high");
        EMISSION = _emission;
    }

    function setRebase(uint256 _max, uint256 _slope) external {
        require(msg.sender == team, "not team");
        require(_max <= PRECISION, "rate too high");
        REBASEMAX = _max;
        REBASESLOPE = _slope;
    }

    // calculate circulating supply as total token supply - locked supply
    function circulating_supply() public view returns (uint256) {
        return _shipe.totalSupply() - _shipe.balanceOf(address(_ve));
    }

    // emission calculation is 1% of available supply to mint adjusted by circulating / total supply
    function calculate_emission() public view returns (uint256) {
        return (weekly * EMISSION) / PRECISION;
    }

    // weekly emission takes the max of calculated (aka target) emission versus circulating tail end emission
    function weekly_emission() public view returns (uint256) {
        return MathUpgradeable.max(calculate_emission(), circulating_emission());
    }

    // calculates tail end (infinity) emissions as 0.2% of total supply
    function circulating_emission() public view returns (uint256) {
        return (circulating_supply() * TAIL_EMISSION) / PRECISION;
    }

    // calculate the rebase protection rate, which is to protect against inflation
    function calculate_rebase(uint256 _weeklyMint) public view returns (uint256) {
        uint256 _veTotal = _shipe.balanceOf(address(_ve));
        uint256 _shipeTotal = _shipe.totalSupply();

        uint256 lockedShare = (_veTotal * REBASESLOPE) / _shipeTotal;
        if (lockedShare >= REBASEMAX) {
            lockedShare = REBASEMAX;
        }

        return (_weeklyMint * lockedShare) / PRECISION;
    }

    // update period can only be called once per cycle (1 week)
    function update_period() external returns (uint256) {
        uint256 _period = active_period;
        if (block.timestamp >= _period + EPOCH_DURATION && _initializer == address(0)) {
            // only trigger if new week
            _period = (block.timestamp / EPOCH_DURATION) * EPOCH_DURATION;
            active_period = _period;

            if (!isFirstMint) {
                weekly = weekly_emission();
            } else {
                isFirstMint = false;
            }

            uint256 _rebase = calculate_rebase(weekly);
            uint256 _teamEmissions = (weekly * teamRate) / PRECISION;
            uint256 _required = weekly;

            uint256 _gauge = weekly - _rebase - _teamEmissions;

            uint256 _balanceOf = _shipe.balanceOf(address(this));
            if (_balanceOf < _required) {
                _shipe.mint(address(this), _required - _balanceOf);
            }

            require(_shipe.transfer(team, _teamEmissions));

            require(_shipe.transfer(address(_rewards_distributor), _rebase));
            _rewards_distributor.checkpoint_token(); // checkpoint token balance that was just minted in rewards distributor
            _rewards_distributor.checkpoint_total_supply(); // checkpoint supply

            _shipe.approve(address(_voter), _gauge);
            _voter.notifyRewardAmount(_gauge);

            emit Mint(msg.sender, weekly, circulating_supply(), circulating_emission());
        }
        return _period;
    }

    function check() external view returns (bool) {
        uint256 _period = active_period;
        return (block.timestamp >= _period + EPOCH_DURATION && _initializer == address(0));
    }

    function period() external view returns (uint256) {
        return (block.timestamp / EPOCH_DURATION) * EPOCH_DURATION;
    }

    function setRewardDistributor(address _rewardDistro) external {
        require(msg.sender == team);
        _rewards_distributor = IRewardsDistributor(_rewardDistro);
    }
}
