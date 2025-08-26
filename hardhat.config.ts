import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-ignition'
import '@openzeppelin/hardhat-upgrades'
import * as dotenv from 'dotenv'

dotenv.config()

// Get environment variables
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || ''
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''

const config: HardhatUserConfig = {
  // Include test contracts in compilation
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },

  // Add test contracts to compilation sources
  solidity: {
    version: '0.8.29',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  sourcify: {
    enabled: true
  }
}

export default config
