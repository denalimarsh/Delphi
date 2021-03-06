const _ = require('lodash');

const BodhiServer = require('./server');
const BodhiConfig = require('./config');
const BodhiDb = require('./db');
const Constants = require('./constants');
const Utils = require('./utils');
const EmitterHelper = require('./utils/emitterHelper');
const { getLogger } = require('./utils/logger');
const AddressManager = require('./api/address_manager');
const BaseContract = require('./api/base_contract');
const Blockchain = require('./api/blockchain');
const BodhiToken = require('./api/bodhi_token');
const CentralizedOracle = require('./api/centralized_oracle');
const DecentralizedOracle = require('./api/decentralized_oracle');
const DelphiOracle = require('./api/delphi_oracle');
const EventFactory = require('./api/event_factory');
const Oracle = require('./api/oracle');
const QtumUtils = require('./api/qtum_utils');
const TopicEvent = require('./api/topic_event');
const Transaction = require('./api/transaction');
const Wallet = require('./api/wallet');

const { startServer } = BodhiServer;
const { blockchainEnv } = Constants;
const { getDevQtumExecPath } = Utils;
if (_.includes(process.argv, '--testnet')) {
  startServer(blockchainEnv.TESTNET, getDevQtumExecPath());
} else if (_.includes(process.argv, '--mainnet')) {
  startServer(blockchainEnv.MAINNET, getDevQtumExecPath());
} else {
  console.log('testnet/mainnet flag not found. startServer() will need to be called explicitly.');
}

module.exports = {
  BodhiServer,
  BodhiConfig,
  BodhiDb,
  Constants,
  Utils,
  EmitterHelper,
  getLogger,
  AddressManager,
  BaseContract,
  Blockchain,
  BodhiToken,
  CentralizedOracle,
  DecentralizedOracle,
  DelphiOracle,
  EventFactory,
  Oracle,
  QtumUtils,
  TopicEvent,
  Transaction,
  Wallet,
};
