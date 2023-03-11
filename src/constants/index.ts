export const ONE_HOUR_MINUTES_SECONDS = 60 * 60;
export const ONE_HOUR_MILLISECONDS = ONE_HOUR_MINUTES_SECONDS * 1000;
export const REMAINING_TIME_IN_SECONDS = parseInt(
  process.env.REMAINING_TIME_IN_SECONDS
) as number;
export const TOLERANCE_FIVE_MINUTES = 5 * 60;
export const CHANNEL_ID = process.env.CHANNEL_ID as string;
