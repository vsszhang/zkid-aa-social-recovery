/// @title  ZkidAccount based on SA
/// @author vsszhang
/// @notice In this social recovery model, we stipilate that there are a total of
///         three verifiers and guardians, every guardian must undergo qualification
///         verification from these three verifiers.
/// @dev    The proposal number is an incrementing number for off-chain maintenance, and it
///         is necessary to ensure that each proposal number submitted to the contract is
///         unique.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@account-abstraction/contracts/samples/SimpleAccount.sol";

contract ZkidAccount is SimpleAccount {
    // new owner of SA
    // must set address(0) after using
    address public newOwner = address(0);

    // verifier's address
    address public VERIFIER0;
    address public VERIFIER1;
    address public VERIFIER2;

    // proposal num => guardin => bool (is guardin or not)
    mapping(uint256 => mapping(address => bool)) public isGuardin;

    // proposal num => guardian => verifier => uint8 (0 is false, 1 is true)
    mapping(uint256 => mapping(address => mapping(address => uint8)))
        public isQualified;

    // proposal num => guardian => uint8 (aggreeOrNot, 0 is false, 1 is true)
    mapping(uint256 => mapping(address => uint8)) public aggreeOrNot;

    // emit when owner change to an new owner
    event ChangeOwner(address indexed oldOwner, address indexed newOwner);

    // emit when guardian submit a recovery propsoal
    event RecoveryProposal(
        uint256 indexed proposalNum,
        address indexed guardian
    );

    // emit when remove owner
    event VerifierRemove(
        address indexed oldVerifier0,
        address indexed oldVerifier1,
        address indexed oldVerifier2
    );

    constructor(IEntryPoint entryPoint) SimpleAccount(entryPoint) {}

    function initialize(address anOwner) public override initializer {
        _initialize(anOwner);
    }

    // step1: User submitted an address pending approval by the guardian.
    function recordNewOwner(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }

    // step2-0: registration of verifier
    function verifierRegistrate(address[] memory verifiers) public onlyOwner {
        require(verifiers.length == 3, "verifier number must be 3");
        require(
            verifiers[0] != verifiers[1] &&
                verifiers[0] != verifiers[2] &&
                verifiers[1] != verifiers[2],
            "must input 3 different verifiers"
        );
        VERIFIER0 = verifiers[0];
        VERIFIER1 = verifiers[1];
        VERIFIER2 = verifiers[2];
    }

    // step2-0': remove verifier
    function verifierRemove() public onlyOwner {
        address oldVerifier0 = VERIFIER0;
        address oldVerifier1 = VERIFIER1;
        address oldVerifier2 = VERIFIER2;

        delete VERIFIER0;
        delete VERIFIER1;
        delete VERIFIER2;

        emit VerifierRemove(oldVerifier0, oldVerifier1, oldVerifier2);
    }

    // step2-1: verifier provides the qualification verification results of the guardian.
    function submitVpVerifyRes(
        uint256 proposalNum,
        address guardian,
        bool isVerified
    ) public onlyVerifier {
        require(guardian != address(0), "guardian can not be address(0)");
        if (isVerified) {
            isQualified[proposalNum][guardian][msg.sender] = 1;
        } else {
            isQualified[proposalNum][guardian][msg.sender] = 0;
        }

        // register curreny propsoal guardin
        isGuardin[proposalNum][guardian] = true;
    }

    // step2-2: guardian submit recovery proposal
    function submitRecovery(
        uint256 proposalNum,
        bool _aggreeOrNot
    ) public onlyQualifiedGuardian(proposalNum) {
        require(
            isGuardin[proposalNum][msg.sender] == true,
            "u are not gardian"
        );
        if (_aggreeOrNot) {
            aggreeOrNot[proposalNum][msg.sender] = 1;
        } else {
            aggreeOrNot[proposalNum][msg.sender] = 0;
        }

        emit RecoveryProposal(proposalNum, msg.sender);
    }

    // step3: user initiate a change ower request (must passed by guardian recovery proposal)
    function changeOwner(
        uint256 proposalNum,
        address[] memory guardians
    ) public onlyOwner {
        require(newOwner != address(0), "can not set owner is address(0)");
        require(
            judgeProposalRecovery(proposalNum, guardians),
            "guardians disaggree your recovery :("
        );
        owner = newOwner;
        emit ChangeOwner(owner, newOwner);

        // reset social recovery status
        reset(proposalNum, guardians);
    }

    ////////////////// Helper //////////////////

    function judgeProposalRecovery(
        uint256 proposalNum,
        address[] memory guardians
    ) internal view returns (bool) {
        require(guardians.length == 3, "guardian's number must be 3");
        uint8 res = 0;
        for (uint8 i = 0; i < guardians.length; i++) {
            res += aggreeOrNot[proposalNum][guardians[i]];
        }

        if (res >= 2) {
            return true;
        } else {
            return false;
        }
    }

    /// @notice reset proposal status after changing owner
    /// @param proposalNum proposal number
    /// @param guardians address array of guardians
    function reset(uint256 proposalNum, address[] memory guardians) internal {
        for (uint i = 0; i < guardians.length; i++) {
            delete isGuardin[proposalNum][guardians[i]];

            delete isQualified[proposalNum][guardians[i]][VERIFIER0];
            delete isQualified[proposalNum][guardians[i]][VERIFIER1];
            delete isQualified[proposalNum][guardians[i]][VERIFIER2];

            delete aggreeOrNot[proposalNum][guardians[i]];
        }
    }

    modifier onlyVerifier() {
        require(
            msg.sender == VERIFIER0 ||
                msg.sender == VERIFIER1 ||
                msg.sender == VERIFIER2,
            "only registed verifiers"
        );
        _;
    }

    modifier onlyQualifiedGuardian(uint256 proposalNum) {
        uint8 res = isQualified[proposalNum][msg.sender][VERIFIER0] +
            isQualified[proposalNum][msg.sender][VERIFIER1] +
            isQualified[proposalNum][msg.sender][VERIFIER2];
        require(res == 2, "u are not qualified guardian");
        _;
    }
}
