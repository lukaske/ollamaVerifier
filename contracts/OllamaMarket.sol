// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OllamaVerifier} from "./OllamaVerifier.sol";

contract OllamaMarket is 
    Initializable, // initializer
    ContextUpgradeable, // _msgSender, _msgData
    ERC165Upgradeable, // supportsInterface
    AccessControlUpgradeable, // RBAC
    AccessControlEnumerableUpgradeable, // RBAC enumeration
    ERC1967UpgradeUpgradeable, // delegate slots, proxy admin, private upgrade
    UUPSUpgradeable // public upgrade 
{
    OllamaVerifier verifier;

    struct Request {
        string modelName;
        string prompt;
        string request_context;
        uint64 timestamp;
        string response;
        string response_context;
        bytes sig;
    }

    uint256 requestCount;
    mapping(uint256 => Request) public requests;

    event VerifierUpdated(address indexed verifier);
    event RequestCreated(uint256 indexed id, string modelName, string prompt, string request_context);
    event RequestCompleted(uint256 indexed id, uint256 timestamp, string response, string response_context, bytes sig);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(address _verifier, address _admin) initializer public {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __AccessControl_init_unchained();
        __AccessControlEnumerable_init_unchained();
        __ERC1967Upgrade_init_unchained();
        __UUPSUpgradeable_init_unchained();

        _setupRole(DEFAULT_ADMIN_ROLE, _admin);

        _updateVerifier(_verifier);
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "only admin");
        _;
    }

    //-------------------------------- Overrides start --------------------------------//

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165Upgradeable, AccessControlUpgradeable, AccessControlEnumerableUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _grantRole(bytes32 role, address account) internal virtual override(AccessControlUpgradeable, AccessControlEnumerableUpgradeable) {
        super._grantRole(role, account);
    }

    function _revokeRole(bytes32 role, address account) internal virtual override(AccessControlUpgradeable, AccessControlEnumerableUpgradeable) {
        super._revokeRole(role, account);

        // protect against accidentally removing all admins
        require(getRoleMemberCount(DEFAULT_ADMIN_ROLE) != 0, "SV:RR-All admins cant be removed");
    }

    function _authorizeUpgrade(address /*account*/) onlyAdmin internal view override {}

    //-------------------------------- Overrides end --------------------------------//

    function updateVerifier(address _verifier) public onlyAdmin {
        _updateVerifier(_verifier);
    }

    function _updateVerifier(address _verifier) internal {
        verifier = OllamaVerifier(_verifier);
        emit VerifierUpdated(_verifier);
    }

    function createRequest(
        string memory modelName,
        string memory prompt,
        string memory request_context
    ) public returns(uint256) {
        requestCount++;
        requests[requestCount] = Request(modelName, prompt, request_context, 0, "", "", "");

        emit RequestCreated(requestCount, modelName, prompt, request_context);
        return requestCount;
    }

    function serveRequest(
        uint256 requestId,
        uint64 timestamp,
        string memory response,
        string memory response_context,
        bytes memory sig
    ) public {
        Request storage request = requests[requestId];
        require(request.timestamp == 0, "response already received");
        verifier.verifyResult(timestamp, request.modelName, request.prompt, request.request_context, response, response_context, sig);
        request.timestamp = timestamp;
        request.response = response;
        request.response_context = response_context;
        request.sig = sig;
        emit RequestCompleted(requestId, timestamp, response, response_context, sig);
    }
}