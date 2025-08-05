import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'

describe('KESX Upgrade Process', function () {
  async function deployV1Fixture() {
    const [owner, user1, user2] = await ethers.getSigners()

    const name = 'Kenyan Shilling Stablecoin'
    const symbol = 'KESX'
    const initialSupply = 1000000 // 1 million tokens

    // Deploy V1 contract
    const KESXUpgradeableV1 = await ethers.getContractFactory('KESXUpgradeable')
    const tokenV1 = (await upgrades.deployProxy(
      KESXUpgradeableV1,
      [name, symbol, initialSupply, owner.address],
      {
        initializer: 'initialize',
        kind: 'uups'
      }
    )) as any

    await tokenV1.waitForDeployment()
    const tokenAddress = await tokenV1.getAddress()

    return {
      tokenV1,
      tokenAddress,
      name,
      symbol,
      initialSupply,
      owner,
      user1,
      user2
    }
  }

  describe('V1 Contract Deployment and Initial State', function () {
    it('Should deploy V1 contract successfully', async function () {
      const { tokenV1, name, symbol, initialSupply, owner } =
        await loadFixture(deployV1Fixture)

      expect(await tokenV1.name()).to.equal(name)
      expect(await tokenV1.symbol()).to.equal(symbol)
      expect(await tokenV1.totalSupply()).to.equal(
        ethers.parseUnits(initialSupply.toString(), 18)
      )
      expect(await tokenV1.owner()).to.equal(owner.address)
    })

    it('Should allow basic V1 functionality', async function () {
      const { tokenV1, owner, user1 } = await loadFixture(deployV1Fixture)

      // Test minting
      const mintAmount = ethers.parseUnits('1000', 18)
      await tokenV1.mint(user1.address, mintAmount)
      expect(await tokenV1.balanceOf(user1.address)).to.equal(mintAmount)

      // Test transfer
      const transferAmount = ethers.parseUnits('500', 18)
      await tokenV1.connect(user1).transfer(owner.address, transferAmount)
      expect(await tokenV1.balanceOf(user1.address)).to.equal(
        mintAmount - transferAmount
      )
    })
  })

  describe('Upgrade Process: V1 to V2', function () {
    it('Should upgrade from V1 to V2 successfully', async function () {
      const { tokenV1, tokenAddress, owner } =
        await loadFixture(deployV1Fixture)

      // Deploy V2 implementation
      const KESXUpgradeableV2 =
        await ethers.getContractFactory('KESXUpgradeableV2')

      // Upgrade the proxy
      const tokenV2 = (await upgrades.upgradeProxy(
        tokenAddress,
        KESXUpgradeableV2
      )) as any
      await tokenV2.waitForDeployment()

      // Initialize V2 specific parameters
      const maxSupply = ethers.parseUnits('10000000', 18) // 10 million tokens
      await tokenV2.initializeV2(maxSupply)

      // Verify V2 state
      expect(await tokenV2.maxSupply()).to.equal(maxSupply)
      expect(await tokenV2.paused()).to.equal(false)
      expect(await tokenV2.totalMinted()).to.equal(await tokenV2.totalSupply())
    })

    it('Should preserve all V1 data after upgrade', async function () {
      const {
        tokenV1,
        tokenAddress,
        name,
        symbol,
        initialSupply,
        owner,
        user1
      } = await loadFixture(deployV1Fixture)

      // Perform some operations on V1
      const mintAmount = ethers.parseUnits('1000', 18)
      await tokenV1.mint(user1.address, mintAmount)
      await tokenV1
        .connect(user1)
        .transfer(owner.address, ethers.parseUnits('500', 18))

      // Record V1 state
      const v1TotalSupply = await tokenV1.totalSupply()
      const v1OwnerBalance = await tokenV1.balanceOf(owner.address)
      const v1User1Balance = await tokenV1.balanceOf(user1.address)

      // Upgrade to V2
      const KESXUpgradeableV2 =
        await ethers.getContractFactory('KESXUpgradeableV2')
      const tokenV2 = (await upgrades.upgradeProxy(
        tokenAddress,
        KESXUpgradeableV2
      )) as any
      await tokenV2.waitForDeployment()

      // Initialize V2
      const maxSupply = ethers.parseUnits('10000000', 18)
      await tokenV2.initializeV2(maxSupply)

      // Verify all V1 data is preserved
      expect(await tokenV2.name()).to.equal(name)
      expect(await tokenV2.symbol()).to.equal(symbol)
      expect(await tokenV2.totalSupply()).to.equal(v1TotalSupply)
      expect(await tokenV2.balanceOf(owner.address)).to.equal(v1OwnerBalance)
      expect(await tokenV2.balanceOf(user1.address)).to.equal(v1User1Balance)
      expect(await tokenV2.owner()).to.equal(owner.address)
    })
  })

  describe('V2 New Functionality', function () {
    it('Should have new V2 features working', async function () {
      const { tokenAddress, owner, user1 } = await loadFixture(deployV1Fixture)

      // Upgrade to V2
      const KESXUpgradeableV2 =
        await ethers.getContractFactory('KESXUpgradeableV2')
      const tokenV2 = (await upgrades.upgradeProxy(
        tokenAddress,
        KESXUpgradeableV2
      )) as any
      await tokenV2.waitForDeployment()

      const maxSupply = ethers.parseUnits('10000000', 18)
      await tokenV2.initializeV2(maxSupply)

      // Test pause functionality
      expect(await tokenV2.paused()).to.equal(false)
      await tokenV2.pause()
      expect(await tokenV2.paused()).to.equal(true)

      // Test that transfers are blocked when paused
      await expect(
        tokenV2
          .connect(user1)
          .transfer(owner.address, ethers.parseUnits('100', 18))
      ).to.be.revertedWith('KESX: Token transfers paused')

      // Test unpause
      await tokenV2.unpause()
      expect(await tokenV2.paused()).to.equal(false)

      // Test max supply functionality
      const remainingSupply = await tokenV2.remainingMintableSupply()
      expect(remainingSupply).to.be.gt(0)

      // Test minting with supply cap
      await tokenV2.mint(user1.address, remainingSupply)
      expect(await tokenV2.totalMinted()).to.equal(await tokenV2.maxSupply())

      // Test that minting beyond max supply fails
      await expect(
        tokenV2.mint(user1.address, ethers.parseUnits('1', 18))
      ).to.be.revertedWith('KESX: Exceeds max supply')
    })

    it('Should allow max supply updates', async function () {
      const { tokenAddress, owner } = await loadFixture(deployV1Fixture)

      // Upgrade to V2
      const KESXUpgradeableV2 =
        await ethers.getContractFactory('KESXUpgradeableV2')
      const tokenV2 = (await upgrades.upgradeProxy(
        tokenAddress,
        KESXUpgradeableV2
      )) as any
      await tokenV2.waitForDeployment()

      const initialMaxSupply = ethers.parseUnits('10000000', 18)
      await tokenV2.initializeV2(initialMaxSupply)

      // Update max supply
      const newMaxSupply = ethers.parseUnits('15000000', 18)
      await expect(tokenV2.setMaxSupply(newMaxSupply))
        .to.emit(tokenV2, 'MaxSupplyUpdated')
        .withArgs(initialMaxSupply, newMaxSupply)

      expect(await tokenV2.maxSupply()).to.equal(newMaxSupply)
    })

    it('Should not allow non-owner to use V2 admin functions', async function () {
      const { tokenAddress, user1 } = await loadFixture(deployV1Fixture)

      // Upgrade to V2
      const KESXUpgradeableV2 =
        await ethers.getContractFactory('KESXUpgradeableV2')
      const tokenV2 = (await upgrades.upgradeProxy(
        tokenAddress,
        KESXUpgradeableV2
      )) as any
      await tokenV2.waitForDeployment()

      const maxSupply = ethers.parseUnits('10000000', 18)
      await tokenV2.initializeV2(maxSupply)

      // Test that non-owner cannot pause
      await expect(
        tokenV2.connect(user1).pause()
      ).to.be.revertedWithCustomError(tokenV2, 'OwnableUnauthorizedAccount')

      // Test that non-owner cannot set max supply
      await expect(
        tokenV2.connect(user1).setMaxSupply(ethers.parseUnits('20000000', 18))
      ).to.be.revertedWithCustomError(tokenV2, 'OwnableUnauthorizedAccount')
    })
  })

  describe('Upgrade Security', function () {
    it('Should not allow non-owner to upgrade', async function () {
      const { tokenAddress, user1 } = await loadFixture(deployV1Fixture)

      const KESXUpgradeableV2 =
        await ethers.getContractFactory('KESXUpgradeableV2')

      // Try to upgrade with non-owner account
      await expect(
        upgrades.upgradeProxy(tokenAddress, KESXUpgradeableV2.connect(user1))
      ).to.be.reverted
    })

    it('Should maintain upgrade capability after V2 upgrade', async function () {
      const { tokenAddress, owner } = await loadFixture(deployV1Fixture)

      // Upgrade to V2
      const KESXUpgradeableV2 =
        await ethers.getContractFactory('KESXUpgradeableV2')
      const tokenV2 = (await upgrades.upgradeProxy(
        tokenAddress,
        KESXUpgradeableV2
      )) as any
      await tokenV2.waitForDeployment()

      const maxSupply = ethers.parseUnits('10000000', 18)
      await tokenV2.initializeV2(maxSupply)

      // Verify that the contract can still be upgraded (by deploying V2 again as a test)
      const tokenV2Upgraded = (await upgrades.upgradeProxy(
        tokenAddress,
        KESXUpgradeableV2
      )) as any
      await tokenV2Upgraded.waitForDeployment()

      // Verify the contract still works
      expect(await tokenV2Upgraded.name()).to.equal(
        'Kenyan Shilling Stablecoin'
      )
      expect(await tokenV2Upgraded.maxSupply()).to.equal(maxSupply)
    })
  })

  describe('Integration Tests', function () {
    it('Should handle complex upgrade scenarios', async function () {
      const { tokenV1, tokenAddress, owner, user1, user2 } =
        await loadFixture(deployV1Fixture)

      // Perform complex operations on V1
      await tokenV1.mint(user1.address, ethers.parseUnits('1000', 18))
      await tokenV1.mint(user2.address, ethers.parseUnits('2000', 18))
      await tokenV1
        .connect(user1)
        .transfer(user2.address, ethers.parseUnits('500', 18))
      await tokenV1.connect(user2).burn(ethers.parseUnits('100', 18))

      // Record final state
      const v1State = {
        totalSupply: await tokenV1.totalSupply(),
        ownerBalance: await tokenV1.balanceOf(owner.address),
        user1Balance: await tokenV1.balanceOf(user1.address),
        user2Balance: await tokenV1.balanceOf(user2.address)
      }

      // Upgrade to V2
      const KESXUpgradeableV2 =
        await ethers.getContractFactory('KESXUpgradeableV2')
      const tokenV2 = (await upgrades.upgradeProxy(
        tokenAddress,
        KESXUpgradeableV2
      )) as any
      await tokenV2.waitForDeployment()

      const maxSupply = ethers.parseUnits('10000000', 18)
      await tokenV2.initializeV2(maxSupply)

      // Verify state preservation
      expect(await tokenV2.totalSupply()).to.equal(v1State.totalSupply)
      expect(await tokenV2.balanceOf(owner.address)).to.equal(
        v1State.ownerBalance
      )
      expect(await tokenV2.balanceOf(user1.address)).to.equal(
        v1State.user1Balance
      )
      expect(await tokenV2.balanceOf(user2.address)).to.equal(
        v1State.user2Balance
      )

      // Test new V2 functionality with existing state
      await tokenV2.pause()
      expect(await tokenV2.paused()).to.equal(true)

      // Test that existing balances are still accessible when paused
      expect(await tokenV2.balanceOf(user1.address)).to.equal(
        v1State.user1Balance
      )
      expect(await tokenV2.balanceOf(user2.address)).to.equal(
        v1State.user2Balance
      )

      // Unpause and test transfers work again
      await tokenV2.unpause()
      await tokenV2
        .connect(user1)
        .transfer(user2.address, ethers.parseUnits('100', 18))
      expect(await tokenV2.balanceOf(user2.address)).to.equal(
        v1State.user2Balance + ethers.parseUnits('100', 18)
      )
    })
  })
})
