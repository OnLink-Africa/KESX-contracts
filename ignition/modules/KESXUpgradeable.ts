// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const KESXUpgradeableModule = buildModule('KESXUpgradeableModule', (m) => {
  // Default parameters
  const name = m.getParameter('name', 'Kenyan Shilling Stablecoin')
  const symbol = m.getParameter('symbol', 'KESX')
  const initialSupply = m.getParameter('initialSupply', 1000000) // 1 million tokens

  // Deploy the upgradeable ERC20 token using UUPS proxy pattern
  const token = m.contract('KESXUpgradeable', [name, symbol, initialSupply])

  return { token }
})

export default KESXUpgradeableModule
