// Solana
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getGovernanceAccounts,
  Governance,
  Proposal,
  ProposalState,
  pubkeyFilter,
} from "@solana/spl-governance";
// Discord
import { Client, TextChannel } from "discord.js";
// Realms API
import { getCertifiedRealmInfo } from "../models/registry/api";
// tools
import { accountsToPubkeyMap } from "../tools/sdk/accounts";
// Context
import { getConnectionContext } from "./connection";
// Embed factory
import { ProposalEmbedFactory } from "../models/embed";
// Constants
import {
  ONE_HOUR_MINUTES_SECONDS,
  ONE_HOUR_MILLISECONDS,
  REMAINING_TIME_IN_SECONDS,
  TOLERANCE_FIVE_MINUTES,
  CHANNEL_ID,
} from "../constants";
// Types
import { ProposalType } from "../types/types";

export const FetchRealms = (client: Client) => {
  const channel = client.channels.cache.get(CHANNEL_ID);

  if (!process.env.CLUSTER_URL) {
    console.error("Please set CLUSTER_URL in the environment variables!");
    process.exit(1);
  }

  if (!process.env.CHANNEL_ID) {
    console.error("Please set  CHANNEL_ID in the environment variables!");
    process.exit(1);
  }

  function errorWrapper() {
    runNotifier().catch((error) => {
      console.error(error);
    });
  }

  // run every hour, checks if a governance proposal just opened in the last hour
  async function runNotifier() {
    const REALM = process.env.REALM || "MNGO";
    const connectionContext = getConnectionContext("mainnet");
    const realmInfo = await getCertifiedRealmInfo(REALM, connectionContext);

    const connection = new Connection(process.env.CLUSTER_URL!);
    console.log(`- getting all governance accounts for ${REALM}`);
    const governances = await getGovernanceAccounts(
      connection,
      realmInfo!.programId,
      Governance,
      [pubkeyFilter(1, realmInfo!.realmId)!]
    );

    const governancesMap = accountsToPubkeyMap(governances);

    console.log(`- getting all proposals for all governances`);
    const proposalsByGovernance = await Promise.all(
      Object.keys(governancesMap).map((governancePk) => {
        return getGovernanceAccounts(
          connection,
          realmInfo!.programId,
          Proposal,
          [pubkeyFilter(1, new PublicKey(governancePk))!]
        );
      })
    );

    console.log(`- scanning all '${REALM}' proposals`);
    let countJustOpenedForVoting = 0;
    let countOpenForVotingSinceSomeTime = 0;
    let countVotingNotStartedYet = 0;
    let countClosed = 0;
    let countCancelled = 0;
    const NOW_IN_SECONDS = new Date().getTime() / 1000;
    for (const proposals_ of proposalsByGovernance) {
      for (const proposal of proposals_) {
        //// debugging
        // console.log(
        //   `-- proposal ${proposal.account.governance.toBase58()} - ${
        //     proposal.account.name
        //   }`
        // )

        if (
          // proposal is cancelled
          proposal.account.state === ProposalState.Cancelled
        ) {
          countCancelled++;
          continue;
        }

        if (
          // voting is closed
          proposal.account.votingCompletedAt
        ) {
          countClosed++;
          continue;
        }

        if (
          // voting has not started yet
          !proposal.account.votingAt
        ) {
          countVotingNotStartedYet++;
          continue;
        }

        if (
          // proposal opened in last hour
          NOW_IN_SECONDS - proposal.account.votingAt.toNumber() <=
          ONE_HOUR_MINUTES_SECONDS + TOLERANCE_FIVE_MINUTES
        ) {
          // add to counter
          countJustOpenedForVoting++;
          // create embed
          const openingProposalEmbed = ProposalEmbedFactory(
            proposal,
            REALM,
            ProposalType.ProposalJustOpen
          );

          // post embed to relevant channel
          (channel as TextChannel).send({ embeds: [openingProposalEmbed] });
        }
        // proposal opened since some time
        else if (proposal.account.state === ProposalState.Voting) {
          countOpenForVotingSinceSomeTime++;
        }
        // getting remaining seconds
        const remainingInSeconds =
          governancesMap[proposal.account.governance.toBase58()].account.config
            .maxVotingTime +
          proposal.account.votingAt.toNumber() -
          NOW_IN_SECONDS;
        // time remaining in condition in seconds
        if (
          remainingInSeconds > REMAINING_TIME_IN_SECONDS &&
          remainingInSeconds < ONE_HOUR_MINUTES_SECONDS + TOLERANCE_FIVE_MINUTES
        ) {
          // create embed
          const closingProposalEmbed = ProposalEmbedFactory(
            proposal,
            REALM,
            ProposalType.ProposalClosing
          );
          // post embed to relevant channel
          (channel as TextChannel).send({ embeds: [closingProposalEmbed] });
        }
      }
    }
    console.log(
      `-- countOpenForVotingSinceSomeTime: ${countOpenForVotingSinceSomeTime}, countJustOpenedForVoting: ${countJustOpenedForVoting}, countVotingNotStartedYet: ${countVotingNotStartedYet}, countClosed: ${countClosed}, countCancelled: ${countCancelled}`
    );
  }

  // start notifier immediately
  errorWrapper();

  setInterval(errorWrapper, ONE_HOUR_MILLISECONDS);
};
