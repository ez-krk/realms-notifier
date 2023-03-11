import { ProgramAccount, Proposal } from "@solana/spl-governance";
import { EmbedBuilder } from "discord.js";

export const makeEmbed = (
  proposal: ProgramAccount<Proposal>,
  REALM: string
) => {
  const openingProposalEmbed = new EmbedBuilder()
    .setColor(0xaa8ed6)
    .setTitle(`${proposal.account.name}`)
    .setURL(
      `https://realms.today/dao/${escape(
        REALM
      )}/proposal/${proposal.pubkey.toBase58()}`
    )
    .setAuthor({
      name: "Realms Notifier",
      iconURL:
        "https://raw.githubusercontent.com/krk-finance/cdn.krk.finance/main/img/misc/dl.png",
      url: `https://realms.today/dao/${escape(
        REALM
      )}/proposal/${proposal.pubkey.toBase58()}`,
    })
    .setDescription(
      `<@&963322631568891926> [“${
        proposal.account.name
      }” proposal just opened for voting 🗳](https://realms.today/dao/${escape(
        REALM
      )}/proposal/${proposal.pubkey.toBase58()})`
    )
    .setThumbnail(
      "https://raw.githubusercontent.com/krk-finance/cdn.krk.finance/main/img/misc/dl.png"
    )
    .setTimestamp()
    .setFooter({
      text: "Realms Notifier",
      iconURL:
        "https://raw.githubusercontent.com/krk-finance/cdn.krk.finance/main/img/misc/dl.png",
    });
  return openingProposalEmbed;
};
