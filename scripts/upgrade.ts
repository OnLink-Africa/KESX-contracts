import { ethers, upgrades } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Upgrading contracts with the account:', deployer.address)

  // The address of the proxy contract
  const proxyAddress = process.env.PROXY_ADDRESS
  if (!proxyAddress) {
    throw new Error('PROXY_ADDRESS environment variable is required')
  }

  console.log('Upgrading KESXUpgradeable at:', proxyAddress)

  // Deploy the new implementation
  const KESXUpgradeableV2 = await ethers.getContractFactory('KESXUpgradeable')

  // Upgrade the proxy
  const upgraded = await upgrades.upgradeProxy(proxyAddress, KESXUpgradeableV2)
  await upgraded.waitForDeployment()

  console.log('KESXUpgradeable upgraded successfully!')
  console.log(
    'New implementation deployed to:',
    await upgrades.erc1967.getImplementationAddress(proxyAddress)
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
