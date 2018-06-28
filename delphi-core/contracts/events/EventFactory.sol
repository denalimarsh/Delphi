pragma solidity ^0.4.18;

import "./TopicEvent.sol";
import "../storage/IAddressManager.sol";

/// @title Event Factory allows the creation of individual prediction events.
contract EventFactory {
    using ByteUtils for bytes32;

    uint16 public version;
    address private addressManager;
    mapping(bytes32 => TopicEvent) public topics;
    bool public isDelphi;

    // Events
    event TopicCreated(
        uint16 indexed _version,
        address indexed _topicAddress, 
        address indexed _creatorAddress,
        bytes32[10] _name, 
        bytes32[10] _resultNames,
        uint256 _escrowAmount);

    constructor(address _addressManager) public {
        require(_addressManager != address(0));

        addressManager = _addressManager;
        version = IAddressManager(addressManager).currentEventFactoryIndex();
    }
    
    function createTopic(
        address _oracle, 
        bytes32[10] _name, 
        bytes32[10] _resultNames, 
        uint256 _bettingStartTime,
        uint256 _bettingEndTime,
        uint256 _resultSettingStartTime,
        uint256 _resultSettingEndTime,
        bool _isDelphi)
        public
        returns (TopicEvent topicEvent) 
    {
        require(!_name[0].isEmpty());
        require(!_resultNames[0].isEmpty());
        require(!_resultNames[1].isEmpty());

        bytes32 topicHash = getTopicHash(_name, _resultNames, _bettingStartTime, _bettingEndTime, 
            _resultSettingStartTime, _resultSettingEndTime);

        require(address(topics[topicHash]) == 0);

        IAddressManager(addressManager).transferEscrow(msg.sender);

        //Could not pass _isDelphi directly to TopicEvent:
        //  Error: CompilerError: Stack too deep, try removing local variables.
        //  Solution: moved numOfResult calculation to TopicEvent.sol to decrease # of parameters being passed and
        //      decreased _resultNames to bytes[10].

        TopicEvent topic = new TopicEvent(version, msg.sender, _oracle, _name, _resultNames, 
            _bettingStartTime, _bettingEndTime, _resultSettingStartTime, _resultSettingEndTime, addressManager, _isDelphi);

        topics[topicHash] = topic;

        IAddressManager(addressManager).addWhitelistContract(address(topic));

        emit TopicCreated(version, address(topic), msg.sender, _name, _resultNames,
            IAddressManager(addressManager).eventEscrowAmount());

        return topic;
    }

    function getTopicHash(
        bytes32[10] _name, 
        bytes32[10] _resultNames,
        uint256 _bettingStartTime,
        uint256 _bettingEndTime,
        uint256 _resultSettingStartTime,
        uint256 _resultSettingEndTime)
        internal
        pure    
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_name, _resultNames, _bettingStartTime, _bettingEndTime, 
            _resultSettingStartTime, _resultSettingEndTime));
    }
}
