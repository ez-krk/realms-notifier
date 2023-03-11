import { Listener } from "@sapphire/framework";
import { Client } from "discord.js";

import { FetchRealms } from "../utils/fetch-realms";

export class ReadyListener extends Listener {
  public run(client: Client) {
    FetchRealms(client);
  }
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
      event: "ready",
    });
  }
}
