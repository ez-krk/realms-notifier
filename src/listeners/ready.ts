import { Listener, SapphireClient } from "@sapphire/framework";
import { Client } from "discord.js";
import { cp } from "fs";

import { FetchRealmsBackground } from "../utils/wrapper";
import { Wrapper } from "../utils/wrapper";
import { RunAnalytics } from "../tools/sdk/analytics";

export class ReadyListener extends Listener {
  public run(client: Client) {
    console.log("Waking & Baking !");
    console.log(client);
    RunAnalytics();
    FetchRealmsBackground();
  }
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
      event: "ready",
    });
  }
}
