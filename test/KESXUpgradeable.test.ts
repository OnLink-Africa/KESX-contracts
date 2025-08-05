import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'

describe('KESXUpgradeable Token', function () {
  async function deployTokenFixture() {
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners()

    const name = 'Kenyan Shilling Stablecoin'
    const symbol = 'KESX'
    const initialSupply = 1000000 // 1 million tokens

    const KESXUpgradeable = await ethers.getContractFactory('KESXUpgradeable')
    const token = (await upgrades.deployProxy(
      KESXUpgradeable,
      [name, symbol, initialSupply, owner.address],
      {
        initializer: 'initialize',
        kind: 'uups'
      }
    )) as any

    return {
      token,
      name,
      symbol,
      initialSupply,
      owner,
      otherAccount,
      thirdAccount
    }
  }

  describe('Basic Token Properties', function () {
    it('Should set the correct name and symbol', async function () {
      const { token, name, symbol } = await loadFixture(deployTokenFixture)

      expect(await token.name()).to.equal(name)
      expect(await token.symbol()).to.equal(symbol)
    })

    it('Should have the correct decimals (18)', async function () {
      const { token } = await loadFixture(deployTokenFixture)

      expect(await token.decimals()).to.equal(18)
    })

    it('Should mint initial supply to the owner', async function () {
      const { token, initialSupply, owner } =
        await loadFixture(deployTokenFixture)

      const expectedSupply = ethers.parseUnits(initialSupply.toString(), 18)
      expect(await token.totalSupply()).to.equal(expectedSupply)
      expect(await token.balanceOf(owner.address)).to.equal(expectedSupply)
    })
  })

  describe('Ownership Controls', function () {
    it('Should set the owner correctly', async function () {
      const { token, owner } = await loadFixture(deployTokenFixture)

      expect(await token.owner()).to.equal(owner.address)
    })

    it('Should allow ownership transfer', async function () {
      const { token, owner, otherAccount } =
        await loadFixture(deployTokenFixture)

      await token.transferOwnership(otherAccount.address)
      expect(await token.owner()).to.equal(otherAccount.address)
    })

    it('Should not allow non-owners to transfer ownership', async function () {
      const { token, otherAccount, thirdAccount } =
        await loadFixture(deployTokenFixture)

      await expect(
        token.connect(otherAccount).transferOwnership(thirdAccount.address)
      )
        .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount')
        .withArgs(otherAccount.address)
    })

    it('Should allow the owner to renounce ownership', async function () {
      const { token } = await loadFixture(deployTokenFixture)

      await token.renounceOwnership()
      expect(await token.owner()).to.equal(ethers.ZeroAddress)
    })
  })

  describe('Minting', function () {
    it('Should allow owner to mint tokens', async function () {
      const { token, otherAccount } = await loadFixture(deployTokenFixture)

      const mintAmount = ethers.parseUnits('5000', 18)
      await token.mint(otherAccount.address, mintAmount)

      expect(await token.balanceOf(otherAccount.address)).to.equal(mintAmount)
    })

    it('Should increase total supply after minting', async function () {
      const { token, otherAccount } = await loadFixture(deployTokenFixture)

      const initialTotalSupply = await token.totalSupply()
      const mintAmount = ethers.parseUnits('5000', 18)

      await token.mint(otherAccount.address, mintAmount)

      expect(await token.totalSupply()).to.equal(
        initialTotalSupply + mintAmount
      )
    })

    it('Should not allow non-owner to mint tokens', async function () {
      const { token, otherAccount } = await loadFixture(deployTokenFixture)

      const mintAmount = ethers.parseUnits('5000', 18)
      await expect(
        token.connect(otherAccount).mint(otherAccount.address, mintAmount)
      )
        .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount')
        .withArgs(otherAccount.address)
    })
  })

  describe('Burning', function () {
    it('Should allow users to burn their own tokens using burn()', async function () {
      const { token, owner } = await loadFixture(deployTokenFixture)

      const burnAmount = ethers.parseUnits('1000', 18)
      const initialBalance = await token.balanceOf(owner.address)
      const initialTotalSupply = await token.totalSupply()

      await token.burn(burnAmount)

      expect(await token.balanceOf(owner.address)).to.equal(
        initialBalance - burnAmount
      )
      expect(await token.totalSupply()).to.equal(
        initialTotalSupply - burnAmount
      )
    })

    it('Should allow approved users to burn tokens using burnFrom()', async function () {
      const { token, owner, otherAccount } =
        await loadFixture(deployTokenFixture)

      const burnAmount = ethers.parseUnits('1000', 18)
      const initialBalance = await token.balanceOf(owner.address)
      const initialTotalSupply = await token.totalSupply()

      // Approve otherAccount to spend owner's tokens
      await token.approve(otherAccount.address, burnAmount)

      // OtherAccount burns the tokens from owner
      await token.connect(otherAccount).burnFrom(owner.address, burnAmount)

      expect(await token.balanceOf(owner.address)).to.equal(
        initialBalance - burnAmount
      )
      expect(await token.totalSupply()).to.equal(
        initialTotalSupply - burnAmount
      )
    })

    it('Should not allow burnFrom without approval', async function () {
      const { token, owner, otherAccount } =
        await loadFixture(deployTokenFixture)

      const burnAmount = ethers.parseUnits('1000', 18)

      // Try to burn without approval
      await expect(
        token.connect(otherAccount).burnFrom(owner.address, burnAmount)
      ).to.be.reverted
    })
  })

  describe('Transfer Functionality', function () {
    it('Should transfer tokens between accounts', async function () {
      const { token, owner, otherAccount } =
        await loadFixture(deployTokenFixture)

      const transferAmount = ethers.parseUnits('500', 18)
      const initialOwnerBalance = await token.balanceOf(owner.address)
      const initialReceiverBalance = await token.balanceOf(otherAccount.address)

      await token.transfer(otherAccount.address, transferAmount)

      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance - transferAmount
      )
      expect(await token.balanceOf(otherAccount.address)).to.equal(
        initialReceiverBalance + transferAmount
      )
    })

    it('Should not allow transfers exceeding balance', async function () {
      const { token, owner, otherAccount } =
        await loadFixture(deployTokenFixture)

      const balance = await token.balanceOf(owner.address)
      const excessiveAmount = balance + ethers.parseUnits('1', 18)

      await expect(
        token.transfer(otherAccount.address, excessiveAmount)
      ).to.be.revertedWithCustomError(token, 'ERC20InsufficientBalance')
    })

    it('Should allow transferFrom when properly approved', async function () {
      const { token, owner, otherAccount, thirdAccount } =
        await loadFixture(deployTokenFixture)

      const transferAmount = ethers.parseUnits('500', 18)

      // Owner approves otherAccount to spend
      await token.approve(otherAccount.address, transferAmount)

      // Check allowance is set correctly
      expect(
        await token.allowance(owner.address, otherAccount.address)
      ).to.equal(transferAmount)

      // otherAccount transfers owner's tokens to thirdAccount
      await token
        .connect(otherAccount)
        .transferFrom(owner.address, thirdAccount.address, transferAmount)

      expect(await token.balanceOf(thirdAccount.address)).to.equal(
        transferAmount
      )
      expect(
        await token.allowance(owner.address, otherAccount.address)
      ).to.equal(0)
    })

    it('Should not allow transferFrom without approval', async function () {
      const { token, owner, otherAccount, thirdAccount } =
        await loadFixture(deployTokenFixture)

      const transferAmount = ethers.parseUnits('500', 18)

      await expect(
        token
          .connect(otherAccount)
          .transferFrom(owner.address, thirdAccount.address, transferAmount)
      ).to.be.revertedWithCustomError(token, 'ERC20InsufficientAllowance')
    })
  })

  describe('Upgradeability', function () {
    it('Should be upgradeable by the owner', async function () {
      const { token, owner } = await loadFixture(deployTokenFixture)
      const tokenAddress = await token.getAddress()

      // Deploy a new implementation (same contract for testing)
      const KESXUpgradeableV2 =
        await ethers.getContractFactory('KESXUpgradeable')

      // Upgrade the proxy
      const upgraded = (await upgrades.upgradeProxy(
        tokenAddress,
        KESXUpgradeableV2
      )) as any
      await upgraded.waitForDeployment()

      // Verify the contract still works after upgrade
      expect(await upgraded.name()).to.equal('Kenyan Shilling Stablecoin')
      expect(await upgraded.symbol()).to.equal('KESX')
      expect(await upgraded.owner()).to.equal(owner.address)
    })

    it('Should not be upgradeable by non-owner', async function () {
      const { token, otherAccount } = await loadFixture(deployTokenFixture)
      const tokenAddress = await token.getAddress()

      // Deploy a new implementation
      const KESXUpgradeableV2 =
        await ethers.getContractFactory('KESXUpgradeable')

      // Try to upgrade with non-owner account
      await expect(
        upgrades.upgradeProxy(
          tokenAddress,
          KESXUpgradeableV2.connect(otherAccount)
        )
      ).to.be.reverted
    })
  })
})
