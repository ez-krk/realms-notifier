import * as dotenv from "dotenv";
dotenv.config();

import type { ColorResolvable } from "discord.js";
// Discord Config
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string;
if (!DISCORD_BOT_TOKEN) {
  console.error(`DISCORD_BOT_TOKEN not set in the environment variables!`);
  process.exit(1);
}
// Channel for bot to post to (give him permissions)
export const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID as string;
if (!DISCORD_CHANNEL_ID) {
  console.error(`DISCORD_CHANNEL_ID not set in the environment variables!`);
  process.exit(1);
}
// Discord role to ping, must fail if not set
export const DISCORD_ROLE_ID = process.env.DISCORD_ROLE_ID as string;
if (!DISCORD_ROLE_ID) {
  console.error(`DISCORD_ROLE_ID not set in the environment variables!`);
  process.exit(1);
}

export const DISCORD_APP_NAME =
  (process.env.DISCORD_APP_NAME as string) || "Realms Notifier";
if (DISCORD_APP_NAME === "Realms Notifier") {
  console.log(
    `DISCORD_APP_NAME not set, using default name "${DISCORD_APP_NAME}"`
  );
}

export const DISCORD_EMBED_ICON_URL = process.env
  .DISCORD_EMBED_ICON_URL as string;
if (!DISCORD_APP_NAME) {
  console.error(`DISCORD_EMBED_ICON_URL not set in the environment variables!`);
  process.exit(1);
}

// Embed Border Hex Color
export const DISCORD_EMBED_HEX_COLOR =
  (process.env.DISCORD_EMBED_HEX_COLOR as ColorResolvable) || 0x14f195;
if (DISCORD_EMBED_HEX_COLOR == 0x14f195) {
  console.log(
    `DISCORD_EMBED_HEX_COLOR not set, using default "${DISCORD_EMBED_HEX_COLOR}"`
  );
}
