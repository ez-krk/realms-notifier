// Solana
import { ProgramAccount, Proposal } from "@solana/spl-governance";
// Discord
import { EmbedBuilder } from "discord.js";
// Proposal Link Builder
import { ProposalEmbedLink } from "./link";
// Description Builder
import { SetDescription } from "./description";
// Constants
import {
  DISCORD_APP_NAME,
  DISCORD_EMBED_ICON_URL,
  DISCORD_ROLE_ID,
  DISCORD_EMBED_HEX_COLOR,
} from "../../../tools/const/config/discord";
import { REALM_NAME } from "../../../tools/const/config/realms";
// Types
import { ProposalsEmbedsEnum } from "../../../tools/const/types";

export const ProposalEmbedFactory = (
  proposal: ProgramAccount<Proposal>,
  embedEnum: ProposalsEmbedsEnum
) => {
  const rolePing = `<@&${DISCORD_ROLE_ID}>`;
  // Create embed
  const ProposalEmbed = new EmbedBuilder()
    .setColor(DISCORD_EMBED_HEX_COLOR)
    .setTitle(`${proposal.account.name}`)
    .setURL(`${ProposalEmbedLink(proposal)}`)
    .setAuthor({
      name: `${DISCORD_APP_NAME}`,
      iconURL: `${DISCORD_EMBED_ICON_URL}`,
      url: `${ProposalEmbedLink(proposal)}`,
    })
    .setDescription(`${rolePing} ${SetDescription(proposal, embedEnum)}`)
    .setThumbnail(`${DISCORD_EMBED_ICON_URL}`)
    .setTimestamp()
    .setFooter({
      text: `${REALM_NAME} ${DISCORD_APP_NAME}`,
      iconURL: `${DISCORD_EMBED_ICON_URL}`,
    });
  // Return the embed
  return ProposalEmbed;
};
