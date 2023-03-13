// Time related constants
export const ONE_MINUTES_SECONDS = 1 * 60;
export const FIVE_MINUTES_SECONDS = 5 * ONE_MINUTES_SECONDS;
export const ONE_HOUR_SECONDS = 1 * ONE_MINUTES_SECONDS;
export const FIVE_HOUR_SECONDS = 5 * ONE_HOUR_SECONDS;

export const ONE_HOUR_MILLISECONDS = 3600000;
export const DEFAULT_DELAY = ONE_HOUR_MILLISECONDS;

export const DISCORD_EMBED_ICON_URL = process.env
  .DISCORD_EMBED_ICON_URL as string;

export const REALMS_DELAY_MILLISECONDS =
  (parseInt(process.env.REALMS_DELAY_SECONDS!) as number) || DEFAULT_DELAY;
if (!process.env.REALMS_DELAY_MILLISECONDS) {
  console.log(
    `REALMS_DELAY_MILLISECONDS not set, using default 1h (${ONE_HOUR_MILLISECONDS}ms)`
  );
}
export const CLOSING_NOTIFIER_IN_SECONDS =
  (parseInt(process.env.CLOSING_NOTIFIER_IN_SECONDS) as number) ||
  ONE_HOUR_SECONDS;

export const TOLERANCE_SECONDS =
  (parseInt(process.env.TOLERANCE_SECONDS) as number) || ONE_HOUR_SECONDS;

// Logger Time
export const GetNow = () => {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return `${hour}:${minutes}:${seconds}`;
};
export const NowConsole = () => {
  return `├── [${GetNow()}] ──`;
};
