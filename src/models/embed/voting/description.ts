// Solana
import { ProgramAccount, Proposal } from "@solana/spl-governance";
// Proposal Link
import { ProposalEmbedLink } from "./link";
// Constants
import { DISCORD_ROLE_ID } from "../../../tools/const/config/discord";
// Types
import type { ProposalsEmbedsEnum } from "../../../tools/const/types";

export const SetDescription = (
  proposal: ProgramAccount<Proposal>,
  /*  enum EmbedType {
        JustOpen = "just-open",
        Closing = "closing",
        Voting = "voting",
        Closed = "closed",
      }
  */
  embedEnum: ProposalsEmbedsEnum
) => {
  if (embedEnum == "just-open") {
    const description = `<@&${DISCORD_ROLE_ID}> new proposal [“${
      proposal.account.name
    }”](${ProposalEmbedLink(proposal)}) just opened for voting 🗳`;
    return description;
  } else if (embedEnum == "closing") {
    const description = `<@&${DISCORD_ROLE_ID}> [“${
      proposal.account.name
    }”](${ProposalEmbedLink(proposal)}) proposal will close s00n 🗳`;
    return description;
  }
};
