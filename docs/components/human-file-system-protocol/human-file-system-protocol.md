---
title: Human File System
tags:
  - data-aggregation
  - data sharing
  - data storage
description: >-
  The Human File System Protocol SDK is an innovative suite of interoperable
  software libraries, meticulously designed to facilitate the creation of
  user-access controlled digital twins on the blockchai
---

# The Human File System Protocol SDK

**A Simple API for Patient-Controlled Health Data Aggregation, Sharing, and Monetization**

A set of interoperable software libraries that can be used independently to create user-access controlled digital twins on the blockchain.

The libraries can be used independently, but will all be included in the HumanFS SDK.

## The Need for a Human File System Protocol

There are 350k health apps containing various types of symptom and factor data. However, the isolated data's relatively useless in all these silos. To figure out how to actually minimize/avoid chronic disease, all the factor data needs to be combined with the outcome data.

**Web2 Problem**

The web2 solution to combining all this data is a nightmare of

1. creating thousands of OAuth2 data connectors
2. running a bunch of importer cron jobs on AWS.

**Web3 Solution**

User auth/databases/key management/access control/3rd party OAuth tokens abstracted away by a single, easy-to-use API

i.e.

Pain Tracking App A:

`db.collections.create('Arthritis Severity', timeSeriesData);`

Diet-Tracking App B:

`let timeSeriesData = db.collections.get('Arthritis Severity');`

⇒ Making it possible for Diet-Tracking App B (and/or Pain Tracking App A) to easily analyze the relationship between dietary factors and Arthritis Severity using causal inference predictive model control recurrent neural networks.

**📚 Libraries Used**

[Data Storage, Authorization and Sharing](https://github.com/yash-deore/sshr-hackfs) - Lit Programmable Key Pairs (PKPs) for access control over protected health information (PHI) with data storage on Ceramic. XMTP (Extensible Message Transport Protocol) is an open protocol and network for secure, private messaging between patients and physicians.

## Relevant Libraries

* [Zero Knowledge Unique Patient Identifier Key in a Soul Bound NFT](https://app.dework.xyz/hackfs-dhealth-colle/suggestions?taskId=ff0c50bf-3c11-4076-8c9c-18d8c46ecf05) - For patients, owning an NFT of their medical data would be like creating a sentry to guard that personal information. The NFT would act as a gatekeeper, tracking who requested access, who was granted access, and when—and record all those actions publicly.
* [Federated Learning](https://app.dework.xyz/hackfs-dhealth-colle/suggestions?taskId=f25f12a9-7e3d-4488-85f7-023f95f75dfe) - Fluence to perform decentralized analysis of human generated data from applications and backends on peer-to-peer networks
* [Proof of Humanity](https://app.dework.xyz/hackfs-dhealth-colle/suggestions?taskId=db1092b9-91b4-4352-999a-f088ffefd6c8) - The Proof of Attendance Protocol for Sybil Resistant data collection, ensuring that robots aren't selling fake health data.
* [Reward open-source health innovation](https://app.dework.xyz/hackfs-dhealth-colle/suggestions?taskId=7261a8d8-f1ad-493c-a41c-b70a36507763) - Valist to reward public good open-source health technology innovations using Software License NFTs and proof of open-source contribution.
* [Querying specific health data](https://app.dework.xyz/hackfs-dhealth-colle/suggestions?taskId=3a546a7f-2aa6-43a1-8dda-08c5a62c83b4) - Tableland for querying the HumanFS for specific data types and time periods.
* [NFT Health Data Marketplace](https://app.dework.xyz/hackfs-dhealth-colle/main-space-477/projects/nft-health-data-mark) - NFTPort for minting data sets that can be sold to pharmaceutical companies in a health data marketplace.
* [On-Chain Analytics](https://app.dework.xyz/hackfs-dhealth-colle/suggestions?taskId=0114d499-36ff-4451-9d1a-e870c753e155) - Covalent for Health Data NFT marketplaces, On-Chain Analytics / Dashboards, Health Data Wallets, Health Data Asset tracking, and ROI for NFT generation and sales.
