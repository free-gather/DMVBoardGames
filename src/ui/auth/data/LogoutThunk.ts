import type { BaseThunk } from "@bponnaluri/places-js";
import { generateApiThunkWithExternalConfig } from "@bponnaluri/places-js";
import type { LoginComponentStore } from "../types/LoginComponentStore.ts";
import { AuthResponse } from "../types/AuthResponse.ts";
import {AUTH_TOKEN_KEY, SUPABASE_CLIENT_KEY, SUPABASE_CLIENT_URL} from "../../../shared/Params.ts";
import {deleteLocalStoreData, getLocalStorageDataIfPresent} from "@bponnaluri/places-js";
import {IS_LOGGED_IN_KEY, SUCCESS_MESSAGE_KEY} from "../../../shared/Constants.ts";

async function retrieveData() {

  const url = `${SUPABASE_CLIENT_URL}/auth/v1/logout?scope=global`

  const authData = await getLocalStorageDataIfPresent(AUTH_TOKEN_KEY);

  const headers = {
    apiKey: SUPABASE_CLIENT_KEY,
    authorization: "bearer "+authData.access_token
  }

  const data:Response = await fetch(
   url, {
      method: "POST",
      headers:headers
    }
  )

  if (data.ok) {
    deleteLocalStoreData(AUTH_TOKEN_KEY)
    return new AuthResponse(false);
  } else {
    return defaultResponse.defaultFunction("Failed to logout:"+JSON.stringify(data));
  }
}

const defaultResponse = {
  defaultFunction: (error: string) => {
    return new AuthResponse(true, {}, error);
  }
};

export function getLoginComponentStoreFromLogoutResponse(): LoginComponentStore {
  return {
    [IS_LOGGED_IN_KEY]: false,
    [SUCCESS_MESSAGE_KEY]: ''
  };
}


export const LOGOUT_THUNK: BaseThunk = generateApiThunkWithExternalConfig(
  retrieveData,
  defaultResponse,
)
