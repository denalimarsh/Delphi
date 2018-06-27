const StandardTokenMock = artifacts.require('./mocks/StandardTokenMock.sol');
const BlockHeightManager = require('../helpers/block_height_manager');
const assert = require('chai').assert;
const SolAssert = require('../helpers/sol_assert');

const web3 = global.web3;

contract('StandardToken', (accounts) => {
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
    instance = await StandardTokenMock.new(...Object.values(tokenParams), { from: owner });
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

  describe('transferFrom', async () => {
    it('should allow transferring the allowed amount', async () => {
      let ownerBalance = tokenParams._initialBalance;

      // transfers from owner to accounts[1]
      const acct1Allowance = 1000;
      await instance.approve(acct1, acct1Allowance, { from: owner });
      assert.equal(
        await instance.allowance(owner, acct1), acct1Allowance,
        'accounts[1] allowance does not match approved amount',
      );

      await instance.transferFrom(owner, acct1, acct1Allowance, { from: acct1 });
      assert.equal(await instance.balanceOf(acct1), acct1Allowance, 'accounts[1] balance does not match');

      ownerBalance -= acct1Allowance;
      assert.equal(
        await instance.balanceOf(owner), ownerBalance,
        'owner balance does not match after first transfer',
      );

      // transfers from owner to accounts[2]
      const acct2Allowance = 3000;
      await instance.approve(acct2, acct2Allowance, { from: owner });
      assert.equal(
        await instance.allowance(owner, acct2), acct2Allowance,
        'accounts[2] allowance does not match approved amount',
      );

      await instance.transferFrom(owner, acct2, acct2Allowance, { from: acct2 });
      assert.equal(await instance.balanceOf(acct2), acct2Allowance, 'accounts[2] balance does not match');

      ownerBalance -= acct2Allowance;
      assert.equal(
        await instance.balanceOf(owner), ownerBalance,
        'owner balance does not match after second transfer',
      );

      // transfers from accounts[2] to accounts[3]
      const acct3Allowance = 3000;
      await instance.approve(acct3, acct3Allowance, { from: acct2 });
      assert.equal(
        await instance.allowance(acct2, acct3), acct3Allowance,
        'accounts[3] allowance does not match approved amount',
      );

      await instance.transferFrom(acct2, acct3, acct3Allowance, { from: acct3 });
      assert.equal(await instance.balanceOf(acct3), acct3Allowance, 'accounts[3] balance does not match');
      assert.equal(await instance.balanceOf(acct2), 0, 'accounts[2] balance does not match');
    });

    it('should throw if the to address is not valid', async () => {
      try {
        await instance.transferFrom(owner, 0, 1000, { from: acct1 });
      } catch (e) {
        SolAssert.assertRevert(e);
      }
    });

    it('should throw if the from balance is less than the transferring amount', async () => {
      const acct1Allowance = tokenParams._initialBalance + 1;
      await instance.approve(acct1, acct1Allowance, { from: owner });
      assert.equal(
        await instance.allowance(owner, acct1), acct1Allowance,
        'accounts[1] allowance does not match approved amount',
      );

      try {
        await instance.transferFrom(owner, acct1, acct1Allowance, { from: acct1 });
      } catch (e) {
        SolAssert.assertInvalidOpcode(e);
      }
    });

    it('should throw if the value is more than the allowed amount', async () => {
      const acct1Allowance = 1000;
      await instance.approve(acct1, acct1Allowance, { from: owner });
      assert.equal(
        await instance.allowance(owner, acct1), acct1Allowance,
        'accounts[1] allowance does not match approved amount',
      );

      try {
        await instance.transferFrom(owner, acct1, acct1Allowance + 1, { from: acct1 });
      } catch (e) {
        SolAssert.assertInvalidOpcode(e);
      }
    });
  });

  describe('approve', async () => {
    it('should allow approving', async () => {
      const acct1Allowance = 1000;
      await instance.approve(acct1, acct1Allowance, { from: owner });
      assert.equal(
        await instance.allowance(owner, acct1), acct1Allowance,
        'accounts[1] allowance does not match approved amount',
      );

      const acct2Allowance = 3000;
      await instance.approve(acct2, acct2Allowance, { from: owner });
      assert.equal(
        await instance.allowance(owner, acct2), acct2Allowance,
        'accounts[2] allowance does not match approved amount',
      );
    });

    it('should throw if the value is not 0 and has previous approval', async () => {
      const acct1Allowance = 1000;
      await instance.approve(acct1, acct1Allowance, { from: owner });
      assert.equal(
        await instance.allowance(owner, acct1), acct1Allowance,
        'accounts[1] allowance does not match approved amount',
      );

      try {
        await instance.approve(acct1, 123, { from: owner });
      } catch (e) {
        SolAssert.assertRevert(e);
      }
    });
  });

  describe('allowance', async () => {
    it('should return the right allowance', async () => {
      const acct1Allowance = 1000;
      await instance.approve(acct1, acct1Allowance, { from: owner });
      assert.equal(
        await instance.allowance(owner, acct1), acct1Allowance,
        'accounts[1] allowance does not match',
      );

      const acct2Allowance = 3000;
      await instance.approve(acct2, acct2Allowance, { from: owner });
      assert.equal(
        await instance.allowance(owner, acct2), acct2Allowance,
        'accounts[2] allowance does not match',
      );

      assert.equal(await instance.allowance(owner, acct3), 0, 'accounts[3] allowance does not match');
    });
  });
});
