// Solana
import { ProgramAccount, Proposal } from "@solana/spl-governance";
// Constants
import { REALM_NAME } from "../../../tools/const/config/realms";

export const ProposalEmbedLink = (proposal: ProgramAccount<Proposal>) => {
  // build string
  const result = `https://realms.today/dao/${escape(
    REALM_NAME
  )}/proposal/${proposal.pubkey.toBase58()})`;
  // return string
  return result;
};
