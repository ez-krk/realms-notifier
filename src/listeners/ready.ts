import { Listener } from "@sapphire/framework";
import { Client, TextChannel, EmbedBuilder } from "discord.js";

// Solana
import { Connection, PublicKey } from "@solana/web3.js";

import {
  getGovernanceAccounts,
  Governance,
  Proposal,
  ProposalState,
  pubkeyFilter,
} from "@solana/spl-governance";

import { getConnectionContext } from "../utils/connection";

import { getCertifiedRealmInfo } from "../models/registry/api";
import { accountsToPubkeyMap } from "../tools/sdk/accounts";

import { makeEmbed } from "../models/embed";

export class ReadyListener extends Listener {
  public run(client: Client) {
    const fiveMinutesSeconds = 5 * 60;
    const ONE_HOUR_MINUTES_SECONDS = 60 * 60;
    const toleranceSeconds = 30;
    // const guildId = "848016432389160960";
    const channedId = "1082985508122152980";
    const channel = client.channels.cache.get(channedId);

    if (!process.env.CLUSTER_URL) {
      console.error("Please set CLUSTER_URL to a rpc node of choice!");
      process.exit(1);
    }

    function errorWrapper() {
      runNotifier().catch((error) => {
        console.error(error);
      });
    }

    // run every 5 mins, checks if a governance proposal just opened in the last 5 mins
    // and notifies on WEBHOOK_URL
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
      const nowInSeconds = new Date().getTime() / 1000;
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
            nowInSeconds - proposal.account.votingAt.toNumber() <=
            ONE_HOUR_MINUTES_SECONDS + toleranceSeconds
            // proposal opened in last 24 hrs - useful to notify when bot recently stopped working
            // and missed the 5 min window
            // (nowInSeconds - proposal.info.votingAt.toNumber())/(60 * 60) <=
            // 24
          ) {
            countJustOpenedForVoting++;

            // create embed
            const openingProposalEmbed = makeEmbed(proposal, REALM);
            // console.log(embed)
            console.log(openingProposalEmbed);
            // post embed to relevant channel
            (channel as TextChannel).send({ embeds: [openingProposalEmbed] });
          }
          // note that these could also include those in finalizing state, but this is just for logging
          else if (proposal.account.state === ProposalState.Voting) {
            countOpenForVotingSinceSomeTime++;

            //// in case bot has an issue, uncomment, and run from local with webhook url set as env var
            // const msg = `“${
            //     proposal.account.name
            // }” proposal just opened for voting 🗳 https://realms.today/dao/${escape(
            //     REALM
            // )}/proposal/${proposal.pubkey.toBase58()}`
            //
            // console.log(msg)
            // if (process.env.WEBHOOK_URL) {
            //   axios.post(process.env.WEBHOOK_URL, { content: msg })
            // }
          }

          const remainingInSeconds =
            governancesMap[proposal.account.governance.toBase58()].account
              .config.maxVotingTime +
            proposal.account.votingAt.toNumber() -
            nowInSeconds;
          if (
            remainingInSeconds > ONE_HOUR_MINUTES_SECONDS &&
            remainingInSeconds < ONE_HOUR_MINUTES_SECONDS + toleranceSeconds
          ) {
            const closingProposalEmbed = new EmbedBuilder()
              .setColor(0xaa8ed6)
              .setTitle(`${proposal.account.name}`)
              .setURL("https://discord.js.org/")
              .setAuthor({
                name: "Realms Notifier",
                iconURL:
                  "https://raw.githubusercontent.com/krk-finance/cdn.krk.finance/main/img/misc/dl.png",
                url: `https://realms.today/dao/${escape(
                  REALM
                )}/proposal/${proposal.pubkey.toBase58()}`,
              })
              .setDescription(
                `[“${
                  proposal.account.name
                }”proposal will close for voting 🗳 in 24 hrs](https://realms.today/dao/${escape(
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

            const msg = `“${
              proposal.account.name
            }” proposal will close for voting 🗳 https://realms.today/dao/${escape(
              REALM
            )}/proposal/${proposal.pubkey.toBase58()} in 24 hrs`;

            console.log(msg);
            (channel as TextChannel).send({ embeds: [closingProposalEmbed] });
            // if (process.env.WEBHOOK_URL) {
            //   axios.post(process.env.WEBHOOK_URL, { content: msg });
            // }
          }
        }
      }
      console.log(
        `-- countOpenForVotingSinceSomeTime: ${countOpenForVotingSinceSomeTime}, countJustOpenedForVoting: ${countJustOpenedForVoting}, countVotingNotStartedYet: ${countVotingNotStartedYet}, countClosed: ${countClosed}, countCancelled: ${countCancelled}`
      );
    }

    // start notifier immediately
    errorWrapper();

    setInterval(errorWrapper, ONE_HOUR_MINUTES_SECONDS);
  }
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
      event: "ready",
    });
  }
}
