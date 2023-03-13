// HTTP/GQL
import axios from "axios";
import { gql } from "graphql-request";
// Solana
import { PROGRAM_VERSION_V1 } from "@solana/spl-governance";
import { PublicKey } from "@solana/web3.js";
import {
  MAINNET_REALMS,
  DEVNET_REALMS,
  REALM_NAME,
} from "../const/config/realms";
// Realms Banlist
import { EXCLUDED_REALMS } from "../const/config/realms/banlist";
import {
  HOLAPLEX_GRAPQL_URL_DEVNET,
  HOLAPLEX_GRAPQL_URL_MAINNET,
} from "../const/config/solana";
// Tools
import { equalsIgnoreCase } from "../core/strings";
import { arrayToMap } from "../core/script";
// Interfaces
import {
  RealmInfoAsJSON,
  RealmInfo,
  ConnectionContext,
} from "../const/types/interfaces";
import type { UnchartedRealm } from "../const/types";

export function getProgramVersionForRealm(realmInfo: RealmInfo) {
  return realmInfo?.programVersion ?? PROGRAM_VERSION_V1;
}

export function parseCertifiedRealms(realms: RealmInfoAsJSON[]) {
  return realms.map((realm) => ({
    ...realm,
    programId: new PublicKey(realm.programId),
    realmId: new PublicKey(realm.realmId),
    sharedWalletId: realm.sharedWalletId && new PublicKey(realm.sharedWalletId),
    isCertified: true,
    programVersion: realm.programVersion,
    enableNotifi: realm.enableNotifi ?? true, // enable by default
    communityMint: realm.communityMint && new PublicKey(realm.communityMint),
  })) as ReadonlyArray<RealmInfo>;
}

// Returns certified realms
// Note: the certification process is currently done through PRs to this repo
// This is a temp. workaround until we have the registry up and running
export function getCertifiedRealmInfos({ cluster }: ConnectionContext) {
  return cluster === "devnet" ? DEVNET_REALMS : MAINNET_REALMS;
}

export function getCertifiedRealmInfo(
  realmId: string,
  connection: ConnectionContext
) {
  if (!realmId) {
    return undefined;
  }

  const realmInfo = getCertifiedRealmInfos(connection).find(
    (r) =>
      equalsIgnoreCase(r.realmId.toBase58(), realmId) ||
      equalsIgnoreCase(r.symbol, realmId)
  );

  return realmInfo;
}

export const realmInfo = async (
  connection: ConnectionContext
): Promise<RealmInfo> => await getCertifiedRealmInfo(REALM_NAME, connection);

// Returns all known realms from all known spl-gov instances which are not certified
export async function getUnchartedRealmInfos(connection: ConnectionContext) {
  const certifiedRealms = getCertifiedRealmInfos(connection);
  const queryUrl =
    connection.cluster === "devnet"
      ? HOLAPLEX_GRAPQL_URL_DEVNET
      : HOLAPLEX_GRAPQL_URL_MAINNET;
  const query = gql`
    query realms($limit: Int!, $offset: Int!) {
      realms(limit: $limit, offset: $offset) {
        name
        programId
        address
      }
    }
  `;
  const allRealms: {
    data: { data: { realms: UnchartedRealm[] } };
  } = await axios.post(queryUrl, {
    query,
    variables: {
      limit: 10000,
      offset: 0,
    },
  });
  const sortedRealms = allRealms.data.data.realms.sort((r1, r2) =>
    r1.name.localeCompare(r2.name)
  );

  const excludedRealms = arrayToMap(certifiedRealms, (r) =>
    r.realmId.toBase58()
  );

  return Object.values(sortedRealms)
    .map((r) => {
      return !(excludedRealms.has(r.address) || EXCLUDED_REALMS.has(r.address))
        ? createUnchartedRealmInfo(r)
        : undefined;
    })
    .filter(Boolean) as readonly RealmInfo[];
}

export function createUnchartedRealmInfo(realm: UnchartedRealm) {
  return {
    symbol: realm.name,
    programId: new PublicKey(realm.programId),
    realmId: new PublicKey(realm.address),
    displayName: realm.name,
    isCertified: false,
    enableNotifi: true, // enable by default
  } as RealmInfo;
}
