import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { Command, ChatInputCommand } from "@sapphire/framework";
import type { Message } from "discord.js";
import { REALM_NAME } from "../tools/const/config/realms";
import { RunAnalytics } from "../tools/sdk/analytics";

export class RunCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "run",
      aliases: ["run"],
      description: "Run the notifier immediately",
    });
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("run")
        .setDescription(`>_ Run the notifier immediately for ${REALM_NAME}`)
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const msg = await interaction.reply({
      content: `>_ run notify for ${REALM_NAME}?`,
      ephemeral: false,
      fetchReply: true,
    });

    if (isMessageInstance(msg)) {
      RunAnalytics();
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      const proposals = await RunAnalytics();
      console.log(proposals);
      proposals.map((proposal) => {});
      return interaction.editReply(
        `Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`
      );
    }

    return interaction.editReply("Failed to retrieve ping :(");
  }
}
