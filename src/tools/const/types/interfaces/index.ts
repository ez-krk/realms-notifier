// Solana
import type { Connection, PublicKey, AccountInfo } from "@solana/web3.js";
import type { EndpointTypes } from "..";

export interface ConnectionContext {
  cluster: EndpointTypes;
  current: Connection;
  endpoint: string;
}

export interface EndpointInfo {
  name: EndpointTypes;
  url: string;
}

export interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer> | null;
  effectiveMint: PublicKey;
}

export interface RealmInfo {
  symbol: string;
  programId: PublicKey;
  programVersion?: number;
  realmId: PublicKey;
  website?: string;
  // Specifies the realm mainnet name for resource lookups
  // It's required for none mainnet environments when the realm name is different than on mainnet
  displayName?: string;
  // Website keywords
  keywords?: string;
  // twitter:site meta
  twitter?: string;
  // og:image
  ogImage?: string;

  // banner mage
  bannerImage?: string;

  // Allow Realm to send email/SMS/Telegram/etc., notifications to governance members using Notifi
  enableNotifi?: boolean;

  isCertified: boolean;

  // 3- featured DAOs  ,2- new DAO with active proposals, 1- DAOs with active proposal,
  sortRank?: number;

  // The default shared wallet of the DAO displayed on the home page
  // It's used for crowdfunding DAOs like  Ukraine.SOL or #Unchain_Ukraine
  sharedWalletId?: PublicKey;

  communityMint?: PublicKey;
}

export interface RealmInfoAsJSON
  extends Omit<
    RealmInfo,
    "programId" | "realmId" | "isCertified" | "sharedWalletId" | "communityMint"
  > {
  enableNotifi?: boolean;
  programId: string;
  realmId: string;
  sharedWalletId?: string;
  communityMint?: string;
}
