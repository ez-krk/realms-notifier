import * as dotenv from "dotenv";

/**
 * Load environment variables from a .env file, if it exists.
 */

dotenv.config();

import { SapphireClient } from "@sapphire/framework";

const client = new SapphireClient({ intents: ["Guilds", "GuildMessages"] });

client.login(process.env.DISCORD_BOT_TOKEN);
