// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title KESXUpgradeableV2
 * @dev Kenyan Shilling Stablecoin - Upgradeable ERC20 Token V2
 *
 * This is an upgraded version of the KESX token with additional features:
 * - All V1 functionality (ERC20, Burnable, Ownable, UUPS)
 * - Pausable functionality
 * - Maximum supply cap
 * - Emergency pause/unpause functions
 *
 * The contract uses OpenZeppelin's upgradeable contracts to ensure
 * proper upgrade safety and compatibility.
 */
contract KESXUpgradeableV2 is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    // New state variables for V2
    bool public paused;
    uint256 public maxSupply;
    uint256 public totalMinted;

    // Events for V2
    event Paused(address account);
    event Unpaused(address account);
    event MaxSupplyUpdated(uint256 oldMaxSupply, uint256 newMaxSupply);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract with the specified parameters
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param initialSupply The initial supply of tokens
     * @param initialOwner The initial owner of the contract
     */
    function initialize(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner
    ) public initializer {
        __ERC20_init(name, symbol);
        __ERC20Burnable_init();
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();

        _mint(initialOwner, initialSupply * 10 ** decimals());
        totalMinted = initialSupply * 10 ** decimals();
        maxSupply = 10000000 * 10 ** decimals(); // 10 million tokens max
        paused = false;
    }

    /**
     * @dev Initializes V2 specific parameters (called during upgrade)
     * @param _maxSupply The maximum supply cap
     */
    function initializeV2(uint256 _maxSupply) public reinitializer(2) {
        maxSupply = _maxSupply;
        totalMinted = totalSupply();
        paused = false;
    }

    /**
     * @dev Allows the owner to mint new tokens (with supply cap check)
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner whenNotPaused {
        require(totalMinted + amount <= maxSupply, "KESX: Exceeds max supply");
        _mint(to, amount);
        totalMinted += amount;
    }

    /**
     * @dev Pauses all token transfers
     */
    function pause() public onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev Unpauses all token transfers
     */
    function unpause() public onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @dev Updates the maximum supply cap
     * @param _maxSupply The new maximum supply
     */
    function setMaxSupply(uint256 _maxSupply) public onlyOwner {
        require(_maxSupply >= totalMinted, "KESX: Max supply cannot be less than total minted");
        uint256 oldMaxSupply = maxSupply;
        maxSupply = _maxSupply;
        emit MaxSupplyUpdated(oldMaxSupply, _maxSupply);
    }

    /**
     * @dev Returns the remaining mintable supply
     */
    function remainingMintableSupply() public view returns (uint256) {
        return maxSupply - totalMinted;
    }

    /**
     * @dev Override transfer function to check for paused state
     */
    function _update(address from, address to, uint256 value) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }

    /**
     * @dev Required by the OZ UUPS module
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Modifier to check if contract is not paused
     */
    modifier whenNotPaused() {
        require(!paused, "KESX: Token transfers paused");
        _;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[47] private __gap;
}
