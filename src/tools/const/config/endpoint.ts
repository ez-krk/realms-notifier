// Solana
import { Connection } from "@solana/web3.js";
// Constants
import { MAINNET_RPC, DEVNET_RPC } from "./solana";

// Types
import type { EndpointTypes, ConnectionContext } from "../types";

import { EndpointInfo } from "../types/interfaces";

const ENDPOINTS: EndpointInfo[] = [
  {
    name: "mainnet",
    url: MAINNET_RPC,
  },
  {
    name: "devnet",
    url: DEVNET_RPC,
  },
  {
    name: "localnet",
    url: "http://127.0.0.1:8899",
  },
];

console.log(`deployed ENDPOINTS:`, ENDPOINTS);

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
