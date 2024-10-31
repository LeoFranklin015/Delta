# Theseus AI


## Introduction

Theseus AI serves as a decentralized AI oracle designed to empower developers by seamlessly integrating powerful AI functionalities into any smart contract on the NEAR Protocol. This innovative platform allows any NEAR smart contract to call the Theseus oracle contract, enabling it to leverage advanced AI capabilities without the constraints of traditional centralized solutions. By utilizing a network of permissionless nodes, Theseus AI processes complex OpenAI LLM requests, returning transparent and verifiable results. This integration not only enhances the functionality of smart contracts but also paves the way for a new era of decentralized AI applications on the blockchain, where trust, scalability, and efficiency are paramount.

![mindmap](https://github.com/user-attachments/assets/c1314242-0980-4ac2-bbc7-559400ae2eb0)

## Documentation 

Here is a detailed documentation to integrate Theseus AI Oracle into your Near SmartContract. [Documentation](https://hackventures.gitbook.io/theseus)

## Demo 

**Simple GPT**
- Code : https://github.com/fabianferno/theseus/blob/main/contracts/src/contract.ts
- How it works : 
- Demo : https://www.youtube.com/watch?v=WUWF7hHgMrY&list=PLfq8rqFOFl_Wa7biY1bWMmfkY2d1BYjpv&index=1

**FunctionCall in OpenAi**
- Code : https://github.com/fabianferno/theseus/blob/main/contracts/src/functionCallContract/contract.ts
- How it works : https://www.youtube.com/watch?v=1pWa8z0yzMo&list=PLfq8rqFOFl_Wa7biY1bWMmfkY2d1BYjpv&index=3
- Demo : https://www.youtube.com/watch?v=009iPUffcWM&list=PLfq8rqFOFl_Wa7biY1bWMmfkY2d1BYjpv&index=2

**Agent**
- Code : https://github.com/fabianferno/theseus/blob/main/contracts/src/AgentContract/AgentContract.ts
- How it works : 
- Demo : 


## Inspiration

At the intersection of AI and crypto lies untapped potential. Many web3 products envision on-chain AI as the future, bringing transparency, provability, and decentralization to AI interactions. Theseus AI addresses the limitations of existing oracle solutions by enabling verifiable and decentralized AI computation on-chain.

## Features

- **Decentralized AI Computation:** Utilize a network of permissionless nodes to run AI models directly on-chain.
- **Transparent Results:** Receive detailed outputs from AI computations that can be audited for integrity.
- **Scalability:** Handle multiple compute requests in parallel, ensuring efficient processing.

## How We Built It

We utilized a range of cutting-edge tools to develop Theseus AI, including:
- **NEAR Protocol’s Events Indexer**: For indexing events and interactions.
- **Socket.IO**: For real-time communication between components.
- **ZeroMQ**: To facilitate message queuing and processing.
- **NEAR CLI**: For deploying and managing our smart contracts.
- **Next.js & Express**: For building the frontend and backend of the application.

## Key Accomplishments

- Implemented a distribution layer for our oracle service, enabling multiple Theseus nodes to handle compute requests in parallel, which maximizes efficiency in a decentralized environment.

## Roadmap

What's next for Theseus AI:
- **Zero-Knowledge Verifiability**: Implement cryptographic proofs for AI computations to enhance trust and reliability.
- **Enhanced Data Primitives**: Develop richer data structures to better support our AI initiatives.
- **Incentivize the Nodes**: Create a rewards system for nodes that contribute computational power by connecting to Theseus.
