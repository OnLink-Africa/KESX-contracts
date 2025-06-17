# KESX Token Project

This project implements the Kenyan Shilling Stablecoin (KESX) as an ERC20 token using Hardhat and Hardhat Ignition for deployments.

## Overview

The KESX token is a standard ERC20 token with the following default parameters:

- Name: Kenyan Shilling Stablecoin
- Symbol: KESX
- Initial Supply: 1,000,000 tokens (with 18 decimals)

## Deployments

Sepolia: 0xe82426454EAB00a3D7C7Ba2E9f38063e05962880

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

### Local Development

To deploy to a local development network:

```shell
# First start a local node in a separate terminal
npm run node

# Then deploy to the local network
npm run deploy:local
```

### Test Network (Sepolia)

To deploy to the Sepolia test network:

```shell
npm run deploy:testnet
```

### Mainnet Deployment

To deploy to Ethereum mainnet:

```shell
npm run deploy:mainnet
```

### Custom Deployment

To deploy with custom parameters (token name, symbol, or initial supply):

```shell
npm run deploy:custom -- --parameters '{"name":"Custom Token Name","symbol":"CTN","initialSupply":2000000}'
```

## Project Structure

- `contracts/`: Smart contract source files
  - `KESX.sol`: The ERC20 token implementation
- `test/`: Test files for the contracts
- `ignition/modules/`: Hardhat Ignition deployment modules
  - `KESX.ts`: Deployment configuration for the KESX token
