import { client } from "../..";
// Solana
import {
  getGovernanceAccounts,
  Governance,
  Proposal,
  ProposalState,
  pubkeyFilter,
  ProgramAccount,
} from "@solana/spl-governance";
import { Connection, PublicKey } from "@solana/web3.js";
// Realms API
import { getCertifiedRealmInfo } from "./api";
// tools
import { accountsToPubkeyMap } from "./accounts";
// Context
import { getConnectionContext } from "../const/config/solana";
// Embed factory
import { ProposalEmbedFactory } from "../../models/embed/voting/factory";
// Constants

import { REALM_NAME } from "../const/config/realms";
import { CLUSTER_URL } from "../const/config/solana";
import {
  ONE_HOUR_SECONDS,
  FIVE_HOUR_SECONDS,
  CLOSING_NOTIFIER_IN_SECONDS,
} from "../const/config/time";

// Types
import type { RealmInfo } from "../const/types/interfaces";

// for embeds
import type { TextChannel } from "discord.js";
import { DISCORD_CHANNEL_ID } from "../const/config/discord";
import { ProposalsEmbedsEnum } from "../const/types";

export const getRealmsGovernancesInfo = async (
  connection: Connection,
  realmInfo: RealmInfo
) => {
  const value = await getGovernanceAccounts(
    connection,
    realmInfo!.programId,
    Governance,
    [pubkeyFilter(1, realmInfo!.realmId)!]
  );
  console.log(value);
  return value;
};

export const mapGovernances = async (realm: ProgramAccount<Governance>[]) => {
  return accountsToPubkeyMap(realm);
};

export const RealmsAnalytics = async (
  connection: Connection,
  realmInfo: RealmInfo,
  programId: RealmInfo["programId"]
): Promise<ProgramAccount<Proposal>[][]> => {
  const realm = await getRealmsGovernancesInfo(connection, realmInfo);

  const value = await Promise.all(
    Object.keys(mapGovernances(realm)).map((governancePk) => {
      return getGovernanceAccounts(connection, realmInfo!.programId, Proposal, [
        pubkeyFilter(1, new PublicKey(governancePk))!,
      ]);
    })
  );
  return value;
};
const elapsed = (
  now: number
): {
  elapsed: number;
  now: number;
} => {
  const laps = new Date().getTime() - now;
  console.log(laps, "ms");
  return {
    elapsed: laps,
    now,
  };
};

export const RunAnalytics = async (): Promise<ProgramAccount<Proposal>[]> => {
  const now = new Date().getTime();
  // embeds
  const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);

  elapsed(now);

  const connection = new Connection(CLUSTER_URL!);
  const connectionContext = getConnectionContext("mainnet");
  const proposals: ProgramAccount<Proposal>[] = [];

  elapsed(now);

  const realmInfo: RealmInfo = await getCertifiedRealmInfo(
    REALM_NAME,
    connectionContext
  );

  elapsed(now);

  const realm = await getRealmsGovernancesInfo(connection, realmInfo);

  elapsed(now);

  console.log(`- getting all governance accounts for ${REALM_NAME}`);

  console.log("governances :", realm);

  const governancesMap = accountsToPubkeyMap(realm);

  console.log(`- getting all proposals for all governances`);
  const proposalsByGovernance = await Promise.all(
    Object.keys(governancesMap).map((governancePk) => {
      return getGovernanceAccounts(connection, realmInfo!.programId, Proposal, [
        pubkeyFilter(1, new PublicKey(governancePk))!,
      ]);
    })
  );

  console.log(`- scanning all '${REALM_NAME}' proposals`);

  let justOpen = 0;
  let inProgress = 0;
  let notStarted = 0;
  let closed = 0;
  let cancelled = 0;

  for (const availableData of proposalsByGovernance) {
    proposals.push;
    for (const proposal of availableData) {
      // debugging
      // console.log(
      //   `proposal ${proposal.account.governance.toBase58()} - ${
      //     proposal.account.name
      //   }`
      // );

      if (
        // cancelled
        proposal.account.state === ProposalState.Cancelled
      ) {
        cancelled++;
        continue;
      }

      if (
        // voting is closed
        proposal.account.votingCompletedAt
      ) {
        closed++;
        continue;
      }

      if (
        // voting has not started yet
        !proposal.account.votingAt
      ) {
        notStarted++;
        continue;
      }

      if (
        // proposal opened in last hour
        now - proposal.account.votingAt.toNumber() <=
        ONE_HOUR_SECONDS
      ) {
        // add to counter
        justOpen++;
        // create embed
        const openingProposalEmbed = ProposalEmbedFactory(
          proposal,
          ProposalsEmbedsEnum.JustOpen
        );

        // post embed to relevant channel
        (channel as TextChannel).send({ embeds: [openingProposalEmbed] });
      }
      // proposal opened since some time
      else if (proposal.account.state === ProposalState.Voting) {
        inProgress++;
      }

      // getting remaining seconds
      const proposalremainingSeconds =
        governancesMap[proposal.account.governance.toBase58()].account.config
          .maxVotingTime +
        proposal.account.votingAt.toNumber() -
        now;
      // time remaining in condition in seconds
      if (
        proposalremainingSeconds > CLOSING_NOTIFIER_IN_SECONDS &&
        proposalremainingSeconds < FIVE_HOUR_SECONDS
      ) {
        // create embed
        const closingProposalEmbed = ProposalEmbedFactory(
          proposal,
          ProposalsEmbedsEnum.Closing
        );
        // post embed to relevant channel
        (channel as TextChannel).send({ embeds: [closingProposalEmbed] });
      }
    }
  }
  console.log(
    `In Progress : ${inProgress}\nJust Opened : ${justOpen}\nNot Started : ${notStarted}\nClosed : ${closed}\nCancelled: ${cancelled}`
  );
  return proposals;
};
