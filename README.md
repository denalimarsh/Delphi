# Delphi Oracle: BlockchainConnect/DoraHacks Blockchain for Future Hackathon

## Background

The Delphi Oracle project was developed and submitted during the BlockchainConnect/DoraHacks Blockchain for Future Hackathon, a competition sponsored by IoTeX, Huboi, WanChain, and others in partnership with Nebulas, TrueChain, Bodhi, and MOAC.

During the hackathon, our team proposed and implemented new features for the decentralized Bodhi Prediction Network on the QTUM blockchain by integrating the Delphi Oracle smart contract into the project's existing architecture. The Delphi Oracle project was selected by Bodhi as the winner of their 3000 BOT sponsor prize.

### Description

The goal of our project was to allow a smart contract to act as the Oracle at the end of a prediction's first betting phase instead of a trusted centralized expert, thereby decentralizing the process by which a prediction's result is set. To accomplish this, we authored a new smart contract titled DelphiOracle.sol which optionally replaces the CentralizedOracle.sol smart contract which currently facilitates user betting and locks in a prediction's result. The decentralized setting of a prediction's result is only recommended for verifiable, niche predictions which will always have a direct answer, such as 'Will it rain in Dallas, Texas on August 7th, 2018?' or 'Will Russia get past the round of 16 during the 2018 FIFA World Cup?'. Hypothetically, the DelphiOracle.sol smart contract could query a web api after the betting phase has concluded to determine the prediction's result, such as Wunderground's weather api or ESPN's api for the two example questions above.

This process could be facilitated by third-party tools such as Oraclize, a tool designed to enable data-rich smart contracts - but currently, Oraclize's service is only on the ethereum blockchain. If tools such as Oraclize do not become available on QTUM in the near future, Bodhi's smart contracts would still be able to use this service immediately following the planned ethereum cross-chain integration.

### Project Arcitecture

The diagram below shows the smart contract structure of the Bodhi Prediction Network with Delphi Oracle integration. At the bottom, a prediction event's controlling oracles (DelphiOracle, CentralizedOracle, or DecentralizedOracle) are seen overlaid on the event's timeline, denoting which smart contract is facilitating the result setting/voting process at any given point during the event's lifespan.

![alt text](/DelphiOracleContracts.pdf)

- Yellow: new contracts
- Light yellow: pre-existing contracts modified to support Delphi Oracle integration.
- Blue: unmodified contracts

While the proposed smart contracts were integrated with the Bodhi Prediction Network, they were not brought to full functionality due to the rigid time constraints of the hackathon. Bodhi has expressed interest in continuing development on the concepts proposed by the Delphi Oracle project.
