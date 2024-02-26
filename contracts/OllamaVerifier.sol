// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AttestationAutherUpgradeable, IAttestationVerifier} from "./lib/AttestationVerifierAuther.sol";

contract OllamaVerifier is
    Initializable, // initializer
    ContextUpgradeable, // _msgSender, _msgData
    ERC165Upgradeable, // supportsInterface
    AccessControlUpgradeable, // RBAC
    AccessControlEnumerableUpgradeable, // RBAC enumeration
    ERC1967UpgradeUpgradeable, // delegate slots, proxy admin, private upgrade
    UUPSUpgradeable, // public upgrade
    AttestationAutherUpgradeable 
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(IAttestationVerifier _attestationVerifier, uint256 _maxAge) AttestationAutherUpgradeable(
        _attestationVerifier, 
        _maxAge
    ) initializer {}

    function initialize(
        EnclaveImage[] memory _whitelistedImages,
        address _admin
    ) external initializer {
        require(_whitelistedImages.length != 0, "AV:I-At least one image must be provided");
        require(_admin != address(0), "AV:I-At least one admin necessary");

        __Context_init_unchained();
        __ERC165_init_unchained();
        __AccessControl_init_unchained();
        __AccessControlEnumerable_init_unchained();
        __ERC1967Upgrade_init_unchained();
        __UUPSUpgradeable_init_unchained();
        __AttestationAuther_init_unchained(_whitelistedImages);

        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
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

    function verifyResult(
        bytes32 imageId,
        uint64 timestamp,
        string memory modelName,
        string memory prompt,
        string memory request_context,
        string memory response,
        string memory response_context,
        bytes memory sig
    ) public view {
        bytes32 digest = keccak256(abi.encodePacked(
            "|oyster-hasher|",
            "|timestamp|",
            timestamp,
            "|ollama_signature_parameters|",
            abi.encode(
                modelName,
                prompt,
                request_context,
                response,
                response_context
            )
        ));

        address signer = ECDSAUpgradeable.recover(digest, sig);

        require(_allowOnlyVerified(signer, imageId), "Signer not verified");
    }
}
