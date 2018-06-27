const BasicTokenMock = artifacts.require('./mocks/BasicTokenMock.sol');
const BlockHeightManager = require('../helpers/block_height_manager');
const assert = require('chai').assert;
const SolAssert = require('../helpers/sol_assert');

const web3 = global.web3;

contract('BasicToken', (accounts) => {
  const blockHeightManager = new BlockHeightManager(web3);
  const owner = accounts[0];
  const acct1 = accounts[1];
  const acct2 = accounts[2];
  const acct3 = accounts[3];
  const tokenParams = {
    _initialAccount: owner,
    _initialBalance: 10000000,
  };

  let instance;

  beforeEach(blockHeightManager.snapshot);
  afterEach(blockHeightManager.revert);

  beforeEach(async () => {
    instance = await BasicTokenMock.new(...Object.values(tokenParams), { from: owner });
  });

  describe('constructor', async () => {
    it('should initialize all the values correctly', async () => {
      assert.equal(
        await instance.balanceOf(owner, { from: owner }), tokenParams._initialBalance,
        'owner balance does not match',
      );
      assert.equal(await instance.totalSupply.call(), tokenParams._initialBalance, 'totalSupply does not match');
    });
  });

  describe('transfer', async () => {
    it('should allow transfers if the account has tokens', async () => {
      let ownerBalance = tokenParams._initialBalance;
      assert.equal(await instance.balanceOf(owner, { from: owner }), ownerBalance, 'owner balance does not match');

      // transfer from owner to accounts[1]
      const acct1TransferAmt = 300000;
      await instance.transfer(acct1, acct1TransferAmt, { from: owner });
      assert.equal(await instance.balanceOf(acct1), acct1TransferAmt, 'accounts[1] balance does not match');

      ownerBalance -= acct1TransferAmt;
      assert.equal(
        await instance.balanceOf(owner), ownerBalance,
        'owner balance does not match after first transfer',
      );

      // transfer from owner to accounts[2]
      const acct2TransferAmt = 250000;
      await instance.transfer(acct2, acct2TransferAmt, { from: owner });
      assert.equal(await instance.balanceOf(acct2), acct2TransferAmt, 'accounts[2] balance does not match');

      ownerBalance -= acct2TransferAmt;
      assert.equal(
        await instance.balanceOf(owner, { from: owner }), ownerBalance,
        'new owner balance does not match after second transfer',
      );

      // transfer from accounts[2] to accounts[3]
      await instance.transfer(acct3, acct2TransferAmt, { from: acct2 });
      assert.equal(await instance.balanceOf(acct3), acct2TransferAmt, 'accounts[3] balance does not match');
      assert.equal(await instance.balanceOf(acct2), 0, 'accounts[2] balance should be 0');
    });

    it('should throw if the to address is not valid', async () => {
      try {
        await instance.transfer(0, 1000, { from: owner });
      } catch (e) {
        SolAssert.assertRevert(e);
      }
    });

    it('should throw if the balance of the transferer is less than the amount', async () => {
      assert.equal(await instance.balanceOf(owner), tokenParams._initialBalance, 'owner balance does not match');
      try {
        await instance.transfer(acct1, tokenParams._initialBalance + 1, { from: owner });
      } catch (e) {
        SolAssert.assertInvalidOpcode(e);
      }

      try {
        await instance.transfer(acct3, 1, { from: acct2 });
      } catch (e) {
        SolAssert.assertInvalidOpcode(e);
      }
    });
  });

  describe('balanceOf', async () => {
    it('should return the right balance', async () => {
      assert.equal(await instance.balanceOf(owner), tokenParams._initialBalance, 'owner balance does not match');
      assert.equal(await instance.balanceOf(acct1), 0, 'accounts[1] balance should be 0');
      assert.equal(await instance.balanceOf(acct2), 0, 'accounts[2] balance should be 0');
    });
  });
});
