import * as dotenv from "dotenv";
dotenv.config();

import type { EndpointTypes } from "../types";
import { EndpointInfo } from "../types/interfaces";
import { Connection } from "@solana/web3.js";

// Solana Config
export const MAINNET_RPC =
  (process.env.MAINNET_RPC as string) || "https://rpc.ankr.com/solana";
if (!MAINNET_RPC) {
  console.error("Please set MAINNET_RPC in the environment variables!");
  process.exit(1);
}
export const DEVNET_RPC =
  (process.env.DEVNET_RPC as string) || "https://api.dao.devnet.solana.com/";
if (!DEVNET_RPC) {
  console.error("Please set MAINNET_RPC in the environment variables!");
  process.exit(1);
}
export const CLUSTER_URL = process.env.CLUSTER_URL as string;
if (!CLUSTER_URL) {
  console.error("Please set CLUSTER_URL in the environment variables!");
  process.exit(1);
}
// Holaplex
export const HOLAPLEX_GRAPQL_URL_MAINNET = "https://graph.holaplex.com/v1";
export const HOLAPLEX_GRAPQL_URL_DEVNET =
  "https://graph.devnet.holaplex.tools/v1/graphql";

const ENDPOINTS: EndpointInfo[] = [
  {
    name: "mainnet",
    url:
      process.env.MAINNET_RPC ||
      "http://realms-realms-c335.mainnet.rpcpool.com/258d3727-bb96-409d-abea-0b1b4c48af29/",
  },
  {
    name: "devnet",
    url: process.env.DEVNET_RPC || "https://api.dao.devnet.solana.com/",
  },
  {
    name: "localnet",
    url: "http://127.0.0.1:8899",
  },
];

console.log("deployed ENDPOINTS:", ENDPOINTS);

export interface ConnectionContext {
  cluster: EndpointTypes;
  current: Connection;
  endpoint: string;
}

export function getConnectionContext(cluster: string): ConnectionContext {
  const ENDPOINT = ENDPOINTS.find((e) => e.name === cluster) || ENDPOINTS[0];
  return {
    cluster: ENDPOINT!.name as EndpointTypes,
    current: new Connection(ENDPOINT!.url, "recent"),
    endpoint: ENDPOINT!.url,
  };
}

/**
 * Given ConnectionContext, find the network.
 * @param connectionContext
 * @returns EndpointType
 */
export function getNetworkFromEndpoint(endpoint: string) {
  const network = ENDPOINTS.find((e) => e.url === endpoint);
  if (!network) {
    console.log(endpoint, ENDPOINTS);
    throw new Error("Network not found");
  }
  return network?.name;
}
