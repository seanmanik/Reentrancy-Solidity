const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Reentrancy', () => {

    let deployer
    let bank

    beforeEach(async () => {
        [deployer, user, attacker] = await ethers.getSigners()
        const Bank = await ethers.getContractFactory('Bank', deployer)
        bank = await Bank.deploy()

        //executed in context of deployer account, so deposit is made by the deployer address.
        await bank.deposit({ value: ethers.utils.parseEther('201') })
        await bank.connect(user).deposit({ value: ethers.utils.parseEther('50') })

        const Attacker = await ethers.getContractFactory('Attacker', attacker)
        attackerContract = await Attacker.deploy(bank.address)

    })

    describe('facilitates deposits and withdraws', () => {
        it('accepts deposits', async () => {
            //Check that deposit has taken place, and balance has increased
            const deployerBalance = await bank.balanceOf(deployer.address)
            expect(deployerBalance).to.equal(ethers.utils.parseEther('201'))

            const userBalance = await bank.balanceOf(user.address)
            expect(userBalance).to.eq(ethers.utils.parseEther('50'))
        })

        it('accepts withdraws', async () => {
            //withdraw funds

            await bank.withdraw()
            const deployerBalance = await bank.balanceOf(deployer.address)
            const userBalance = await bank.balanceOf(user.address)

            expect(deployerBalance).to.eq(0)
            expect(userBalance).to.eq(ethers.utils.parseEther('50'))

        })

        it('allows attacker to drain funds from #withdraw()', async () => {
            console.log("~~~~~~Before:~~~~~~")
            console.log(`Bank's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(bank.address))}`)
            console.log(`Attackers's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address))}`)

            await attackerContract.attack({ value: ethers.utils.parseEther('10') })

            console.log("~~~~~~After:~~~~~~")
            console.log(`Bank's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(bank.address))}`)
            console.log(`Attackers's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address))}`)

            expect(await ethers.provider.getBalance(bank.address)).to.eq(ethers.utils.parseEther('1'))
        })
    })
})