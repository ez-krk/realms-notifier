import * as dotenv from "dotenv";
dotenv.config();

import devnetRealms from "./json/devnet.json";
import mainnetBetaRealms from "./json/mainnet-beta.json";
import { parseCertifiedRealms } from "../../../sdk/api";
// Branding
export const REALM_NAME = process.env.REALM_NAME as string;
if (!REALM_NAME) {
  console.error(
    `Please set REALM in the environment variables!\nIt's the non url-encoded (if spaces or special characters)\n in the DAO realms url :\ https://app.realms/dao/< REALM >/`
  );
  process.exit(1);
}
export const MAINNET_REALMS = parseCertifiedRealms(mainnetBetaRealms);
export const DEVNET_REALMS = parseCertifiedRealms(devnetRealms);
