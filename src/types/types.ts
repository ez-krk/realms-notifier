import { EndpointTypes } from "../models/types";
import type { AccountInfo, PublicKey } from "@solana/web3.js";

export interface EndpointInfo {
  name: EndpointTypes;
  url: string;
}

export interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer> | null;
  effectiveMint: PublicKey;
}

export enum ProposalType {
  opening,
}

export enum ProposalType {
  ProposalJustOpen = "proposal-just-open",
  ProposalSomeTimeOpen = "proposal-some-time-open",
  ProposalClosing = "proposal-closing",
}
