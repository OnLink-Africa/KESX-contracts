import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  // Token parameters
  const name = 'My Token'
  const symbol = 'MTK'
  const initialSupply = 1000000 // 1 million tokens

  // Deploy the token
  const TokenFactory = await ethers.getContractFactory('MyToken')
  const token = await TokenFactory.deploy(name, symbol, initialSupply)

  console.log('Token deployed to:', await token.getAddress())
  console.log('Token name:', await token.name())
  console.log('Token symbol:', await token.symbol())
  console.log('Total supply:', ethers.formatEther(await token.totalSupply()))
  console.log(
    'Deployer balance:',
    ethers.formatEther(await token.balanceOf(deployer.address))
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
