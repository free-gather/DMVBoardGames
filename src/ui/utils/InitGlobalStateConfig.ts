import { setupGlobalState } from "../../framework/store/data/StoreUtils.ts";

export const stateFields: Record<string, string> = {
  LOGGED_IN: "isLoggedIn",
};

setupGlobalState(stateFields);
