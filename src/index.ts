"use strict";
import * as dotenv from "dotenv";
dotenv.config();

import { SapphireClient } from "@sapphire/framework";

import { DISCORD_BOT_TOKEN } from "./tools/const/config/discord";

export const client = new SapphireClient({
  intents: ["Guilds", "GuildMessages"],
});

export const login = () => client.login(DISCORD_BOT_TOKEN);

login();
