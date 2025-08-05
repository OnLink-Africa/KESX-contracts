# KESX Token Project

This project implements the Kenyan Shilling Stablecoin (KESX) as an ERC20 token using Hardhat and Hardhat Ignition for deployments. The project now includes both a standard ERC20 implementation and an upgradeable version using OpenZeppelin's UUPS proxy pattern.

## Overview

The KESX token is a standard ERC20 token with the following default parameters:

- Name: Kenyan Shilling Stablecoin
- Symbol: KESX
- Initial Supply: 1,000,000 tokens (with 18 decimals)

## Contract Versions

### Standard KESX Contract (`contracts/KESX.sol`)

- Traditional non-upgradeable ERC20 implementation
- Includes minting, burning, and ownership controls
- Suitable for simple token deployments

### Upgradeable KESX Contract (`contracts/KESXUpgradeable.sol`)

- **NEW**: Upgradeable ERC20 implementation using OpenZeppelin's UUPS proxy pattern
- Same functionality as the standard contract but with upgrade capability
- Follows OpenZeppelin best practices for upgradeable contracts
- Includes storage gaps for future upgrades
- Only the contract owner can perform upgrades

## Deployments

### Upgradeable Contract

KESXUpgradeable deployed to: 0xc1bF2DD5Dd1a0D4CdAd5bDD749BA23e228A7b170
Token name: Kenyan Shilling Stablecoin
Token symbol: KESX
Total supply: 1000000000000000000000000n
Owner: 0xf31FC0D18A24c6Ae4225A0d4eEB709AC0a18E993
Implementation address: 0x3d7c1cfB36f394000406bb24f3D37F602Acbd83e

### None Upgradable Contract Deployment

Sepolia: 0xe82426454EAB00a3D7C7Ba2E9f38063e05962880

Uniswap pool with USDC on Sepolia: <https://app.uniswap.org/positions/v4/ethereum_sepolia/13971>

## Development

Try running some of the following tasks:

```shell
# Compile contracts
npm run compile

# Run tests
npm run test

# Run tests with gas reporting
REPORT_GAS=true npm run test

# Start a local Hardhat node
npm run node

# Check test coverage
npm run coverage

# Generate documentation
npm run docs

# Check contract sizes
npm run size

# Lint Solidity files
npm run solhint
```

## Deployment Instructions

The project includes several deployment scripts for different environments:

### Standard Contract Deployment

To deploy the standard (non-upgradeable) contract:

```shell
# Local development
npm run deploy:local

# Test network (Sepolia)
npm run deploy:testnet

# Mainnet deployment
npm run deploy:mainnet

# Custom deployment
npm run deploy:custom -- --parameters '{"name":"Custom Token Name","symbol":"CTN","initialSupply":2000000}'
```

### Upgradeable Contract Deployment

To deploy the upgradeable contract:

```shell
# Local development
npm run deploy:upgradeable:local

# Test network (Sepolia)
npm run deploy:upgradeable:testnet

# Mainnet deployment
npm run deploy:upgradeable:mainnet
```

### Contract Upgrades

To upgrade an existing upgradeable contract:

```shell
# Set the proxy address in your environment
export PROXY_ADDRESS=0x...

# Upgrade on local network
npm run upgrade:local

# Upgrade on testnet
npm run upgrade:testnet

# Upgrade on mainnet
npm run upgrade:mainnet
```

## Upgradeable Contract Features

### Security Features

- **UUPS Proxy Pattern**: Uses the more gas-efficient UUPS (Universal Upgradeable Proxy Standard) pattern
- **Owner-Only Upgrades**: Only the contract owner can perform upgrades
- **Storage Gaps**: Includes storage gaps to prevent storage collision during upgrades
- **Initializer Pattern**: Uses OpenZeppelin's initializer pattern to prevent re-initialization

### Upgrade Process

1. Deploy the new implementation contract
2. Call the upgrade function (only owner can do this)
3. The proxy will point to the new implementation
4. All existing data and state is preserved

### Best Practices Followed

- Uses OpenZeppelin's battle-tested upgradeable contracts
- Implements proper access controls for upgrades
- Includes comprehensive test coverage for upgrade scenarios
- Follows OpenZeppelin's storage layout guidelines
- Uses the UUPS pattern for better gas efficiency

## Project Structure

- `contracts/`: Smart contract source files
  - `KESX.sol`: The standard ERC20 token implementation
  - `KESXUpgradeable.sol`: The upgradeable ERC20 token implementation
- `test/`: Test files for the contracts
  - `KESX.test.ts`: Tests for the standard contract
  - `KESXUpgradeable.test.ts`: Tests for the upgradeable contract
- `scripts/`: Deployment and utility scripts
  - `deploy-upgradeable.ts`: Script to deploy the upgradeable contract
  - `upgrade.ts`: Script to upgrade existing contracts
- `ignition/modules/`: Hardhat Ignition deployment modules
  - `KESX.ts`: Deployment configuration for the standard KESX token
  - `KESXUpgradeable.ts`: Deployment configuration for the upgradeable KESX token

## Dependencies

The upgradeable contract uses the following OpenZeppelin packages:

- `@openzeppelin/contracts-upgradeable`: Upgradeable contract implementations
- `@openzeppelin/hardhat-upgrades`: Hardhat plugin for managing upgrades

## Security Considerations

- The upgradeable contract follows OpenZeppelin's security best practices
- Only the contract owner can perform upgrades
- Storage layout is carefully managed to prevent collisions
- Comprehensive testing covers upgrade scenarios
- The UUPS pattern is more gas-efficient than the Transparent proxy pattern

## Testing

The upgradeable contract includes extensive tests covering:

- All standard ERC20 functionality
- Ownership controls
- Minting and burning capabilities
- Transfer functionality
- Upgrade scenarios
- Access control for upgrades

Run the tests with:

```shell
npm run test
```
