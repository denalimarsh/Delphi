const _ = require('lodash');
const { Contract } = require('qweb3');

const { getContractMetadata, getQtumRPCAddress } = require('../config');
const Utils = require('../utils');

const ORACLE_CENTRALIZED = 'centralized';
const ORACLE_DECENTRALIZED = 'decentralized';
const ORACLE_DELPHI = 'delphi';

function getContract(oracleType, contractAddress) {
  const metadata = getContractMetadata();

  switch (oracleType) {
    case ORACLE_CENTRALIZED: {
      return new Contract(getQtumRPCAddress(), contractAddress, metadata.CentralizedOracle.abi);
    }
    case ORACLE_DECENTRALIZED: {
      return new Contract(getQtumRPCAddress(), contractAddress, metadata.DecentralizedOracle.abi);
    }
    case ORACLE_DELPHI: {
      return new Contract(getQtumRPCAddress(), contractAddress, metadata.DelphiOracle.abi);
    }
    default: {
      throw new TypeError('Invalid oracle type');
    }
  }
}

const Oracle = {
  async eventAddress(args) {
    const {
      contractAddress, // address
      oracleType, // string
      senderAddress, // address
    } = args;

    if (_.isUndefined(contractAddress)) {
      throw new TypeError('contractAddress needs to be defined');
    }
    if (_.isUndefined(oracleType)) {
      throw new TypeError('oracleType needs to be defined');
    }
    if (_.isUndefined(senderAddress)) {
      throw new TypeError('senderAddress needs to be defined');
    }

    const oracle = getContract(oracleType, contractAddress);
    return oracle.call('eventAddress', {
      methodArgs: [],
      senderAddress,
    });
  },

  async consensusThreshold(args) {
    const {
      contractAddress, // address
      oracleType, // string
      senderAddress, // address
    } = args;

    if (_.isUndefined(contractAddress)) {
      throw new TypeError('contractAddress needs to be defined');
    }
    if (_.isUndefined(oracleType)) {
      throw new TypeError('oracleType needs to be defined');
    }
    if (_.isUndefined(senderAddress)) {
      throw new TypeError('senderAddress needs to be defined');
    }

    const oracle = getContract(oracleType, contractAddress);
    const res = await oracle.call('consensusThreshold', {
      methodArgs: [],
      senderAddress,
    });
    res[0] = Utils.hexToDecimalString(res[0]);
    return res;
  },

  async finished(args) {
    const {
      contractAddress, // address
      oracleType, // string
      senderAddress, // address
    } = args;

    if (_.isUndefined(contractAddress)) {
      throw new TypeError('contractAddress needs to be defined');
    }
    if (_.isUndefined(oracleType)) {
      throw new TypeError('oracleType needs to be defined');
    }
    if (_.isUndefined(senderAddress)) {
      throw new TypeError('senderAddress needs to be defined');
    }

    const oracle = getContract(oracleType, contractAddress);
    return oracle.call('finished', {
      methodArgs: [],
      senderAddress,
    });
  },
};

module.exports = Oracle;