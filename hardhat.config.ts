import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-ignition'

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.29',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: '0.4.24', // For USDC contracts
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ],
    overrides: {
      'contracts/mockUSDC.sol': {
        version: '0.4.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    }
  }
}

export default config
