// Constants
import { REALMS_DELAY_MILLISECONDS } from "../tools/const/config/time";
import { RunAnalytics } from "../tools/sdk/analytics";

export const Wrapper = (f: Function): Function =>
  async function errorWrapper() {
    f().catch((error: Error) => {
      console.error(error);
    });
    return errorWrapper;
  };

export const FetchRealmsBackground = () => {
  // start analytics immediately
  Wrapper(RunAnalytics);
  // next iteration, delay in ms
  setInterval(Wrapper(RunAnalytics), REALMS_DELAY_MILLISECONDS);
};
