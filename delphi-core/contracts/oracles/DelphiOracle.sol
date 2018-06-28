pragma solidity ^0.4.18;

import "./Oracle.sol";

contract DelphiOracle is Oracle {
    address public oracle;
    uint256 public bettingStartTime;
    uint256 public bettingEndTime;
    //Not passed as parameters, calculated once Delphi has set the result
    uint256 public resultSettingStartTime;
    uint256 public resultSettingEndTime;
    
    /*
    * @notice Creates new DelphiOracle contract.
    * @param _version The contract version.
    * @param _owner The address of the owner.
    * @param _eventAddress The address of the Event.
    * @param _numOfResults The number of result options.
    * @param _oracle The address of the DelphiOracle that will ultimately decide the result.
    * @param _bettingStartTime The unix time when betting will start.
    * @param _bettingEndTime The unix time when betting will end.
    * @param _consensusThreshold The BOT amount that needs to be paid by the Oracle for their result to be valid.
    */
    constructor(
        uint16 _version,
        address _owner,
        address _eventAddress,
        uint8 _numOfResults,
        address _oracle,
        uint256 _bettingStartTime,
        uint256 _bettingEndTime,
        uint256 _consensusThreshold)
        Ownable(_owner)
        public
        validAddress(_oracle)
        validAddress(_eventAddress)
    {
        require(_numOfResults > 0);
        require(_bettingEndTime > _bettingStartTime);
        require(_consensusThreshold > 0);

        version = _version;
        eventAddress = _eventAddress;
        numOfResults = _numOfResults;
        oracle = _oracle;
        bettingStartTime = _bettingStartTime;
        bettingEndTime = _bettingEndTime;
        consensusThreshold = _consensusThreshold;
    }

    /// @notice Fallback function that rejects any amount sent to the contract.
    function() external payable {
        revert();
    }

    /*
    * @notice Allows betting on a result using the blockchain token.
    * @param _resultIndex The index of result to bet on.
    */
    function bet(uint8 _resultIndex) 
        external 
        payable
        validResultIndex(_resultIndex)
        isNotFinished()
    {
        require(block.timestamp >= bettingStartTime);
        require(block.timestamp < bettingEndTime);
        require(msg.value > 0);

        balances[_resultIndex].totalBets = balances[_resultIndex].totalBets.add(msg.value);
        balances[_resultIndex].bets[msg.sender] = balances[_resultIndex].bets[msg.sender].add(msg.value);

        ITopicEvent(eventAddress).betFromOracle.value(msg.value)(msg.sender, _resultIndex);
        emit OracleResultVoted(version, address(this), msg.sender, _resultIndex, msg.value, QTUM);
    }

    /* 
    * @notice CentralizedOracle should call this to set the result. Requires the Oracle to approve() BOT in the amount 
    *   of the consensus threshold.
    */
    function setRandomResult()
        external
        isNotFinished()
    {
        require(block.timestamp >= bettingEndTime);
        finished = true;

        //Calculate random result
        //Note: This random number generation technique is not secure as it relies on miners, proof-of-concept only
        uint8 randomResult = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)))%(numOfResults+1));
        uint8 _resultIndex = randomResult-1;
       
        balances[_resultIndex].totalVotes = balances[_resultIndex].totalVotes.add(consensusThreshold);
        balances[_resultIndex].votes[msg.sender] = balances[_resultIndex].votes[msg.sender]
            .add(consensusThreshold);

        //Result setting begins now
        resultSettingStartTime = block.timestamp;
        //Result setting will continue for the same duration as betting
        uint256 bettingDuration = bettingEndTime.sub(bettingStartTime);
        resultSettingEndTime = resultSettingStartTime + bettingDuration;

        ITopicEvent(eventAddress).delphiOracleSetResult(msg.sender, _resultIndex, consensusThreshold);
        emit OracleResultVoted(version, address(this), msg.sender, _resultIndex, consensusThreshold, BOT);
        emit OracleResultSet(version, address(this), _resultIndex);
    }

}
