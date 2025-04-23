// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const ERC20TokenModule = buildModule('ERC20TokenModule', (m) => {
  // Default parameters
  const name = m.getParameter('name', 'Kenyan Shilling Stablecoin')
  const symbol = m.getParameter('symbol', 'KESX')
  const initialSupply = m.getParameter('initialSupply', 1000000) // 1 million tokens

  // Deploy the ERC20 token
  const token = m.contract('ERC20Token', [name, symbol, initialSupply])

  return { token }
})

export default ERC20TokenModule
