import { ethers, upgrades } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  // Contract parameters
  const name = 'Kenyan Shilling Stablecoin'
  const symbol = 'KESX'
  const initialSupply = 1000000 // 1 million tokens

  console.log('Deploying KESXUpgradeable...')

  // Deploy the upgradeable contract
  const KESXUpgradeable = await ethers.getContractFactory('KESXUpgradeable')
  const token = await upgrades.deployProxy(
    KESXUpgradeable,
    [name, symbol, initialSupply, deployer.address],
    {
      initializer: 'initialize',
      kind: 'uups'
    }
  )

  await token.waitForDeployment()
  const tokenAddress = await token.getAddress()

  console.log('KESXUpgradeable deployed to:', tokenAddress)
  console.log('Token name:', await token.name())
  console.log('Token symbol:', await token.symbol())
  console.log('Total supply:', await token.totalSupply())
  console.log('Owner:', await token.owner())

  // Get the implementation address
  const implementationAddress =
    await upgrades.erc1967.getImplementationAddress(tokenAddress)
  console.log('Implementation address:', implementationAddress)

  // Verify the deployment
  console.log('\nVerifying deployment...')
  console.log(
    'Initial supply matches:',
    (await token.totalSupply()).toString() ===
      ethers.parseUnits(initialSupply.toString(), 18).toString()
  )
  console.log(
    'Owner balance matches total supply:',
    (await token.balanceOf(deployer.address)).toString() ===
      (await token.totalSupply()).toString()
  )

  console.log('\nFor future upgrades, use the PROXY address:', tokenAddress)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
