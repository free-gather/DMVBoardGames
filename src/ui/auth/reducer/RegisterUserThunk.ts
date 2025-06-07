import type { DefaultApiAction } from "../../../framework/store/update/api/DefaultApiAction.ts";
import type { BaseThunk } from "../../../framework/store/update/BaseThunk.ts";
import { generateApiThunkWithExternalConfig } from "../../../framework/store/update/api/ApiThunkFactory.ts";
import { AuthResponse } from "../types/AuthResponse.ts";
import type { LoginComponentStore } from "../types/LoginComponentStore.ts";

// @ts-ignore
async function retrieveData(params: any, backupResponse: DefaultApiAction) {
  console.log("New user");
  //TODO: Add logic.
}

const defaultResponse = {
  defaultFunction: (error: string) => {
    console.error("Failed to register user");
    return new AuthResponse(true, {}, error);
  },
  defaultFunctionPriority: false,
};

export function getLoginComponentStoreFromRegisterResponse(): LoginComponentStore {
  console.log("Finished user registration request");
  //TODO: Add logic
  return {
    isLoggedIn: false,
  };
}

export const REGISTER_USER_THUNK: BaseThunk =
  generateApiThunkWithExternalConfig(
    retrieveData,
    defaultResponse,
  ).addGlobalStateReducer((loginState: any) => {
    return {
      isLoggedIn: "false",
    };
  });
