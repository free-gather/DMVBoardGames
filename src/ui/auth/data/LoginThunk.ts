
import type { AuthRequest } from "../types/AuthRequest.ts";
import { AuthResponse } from "../types/AuthResponse.ts";
import {addLocalStorageData, clearSessionStorage, getLocalStorageDataIfPresent} from "@bponnaluri/places-js";
import { isAfterNow } from "@bponnaluri/places-js";
import type { AuthReducerError } from "../types/AuthReducerError.ts";
import {AUTH_TOKEN_KEY, SUPABASE_CLIENT_KEY, SUPABASE_CLIENT_URL} from "../../../shared/Params.ts";
import {GROUP_DESCRIPTION_TEXT} from "../../groups/Constants.ts";
import {IS_LOGGED_IN_KEY} from "../../../shared/Constants.ts";
import {generateApiThunkWithExternalConfig} from "@bponnaluri/places-js";
import type {DefaultApiAction} from "@bponnaluri/places-js";
import {BaseThunk} from "@bponnaluri/places-js";

async function retrieveData(
  params: AuthRequest,
  backupResponse: DefaultApiAction,
): Promise<any> {

  try {
    if (
      backupResponse.defaultFunctionPriority &&
      backupResponse.defaultFunction
    ) {
      return backupResponse.defaultFunction();
    }

    const authData = await getLocalStorageDataIfPresent(AUTH_TOKEN_KEY);
    if (authData && isAfterNow(authData.expires_at)) {
      return {
        loggedIn: true,
        username: authData?.user?.email ?? ''
      }
    }

    if(!params?.username && !params?.password){
      return backupResponse.defaultFunction({});
    }

    const url = `${SUPABASE_CLIENT_URL}/auth/v1/token?grant_type=password`
    const headers = {
      apiKey: SUPABASE_CLIENT_KEY,
    }
    const body = {
      email:params.username,
      password: params.password
    }

    const data:Response = await fetch(
      url, {
        method: "POST",
        headers:headers,
        body:JSON.stringify(body)
      }
    )

    if (data.ok) {

      clearSessionStorage();
      const authTokenData = await data.json();
      addLocalStorageData(AUTH_TOKEN_KEY, JSON.stringify(authTokenData))

      return new AuthResponse(true, {...authTokenData,username:authData?.username});
    }
    const error = await data.json();
    if (backupResponse.defaultFunction) {
      return backupResponse.defaultFunction({
        errorMessage: error?.msg ?? data.statusText
      });
    } else {
      throw Error("Authentication error");
    }
  } catch (e: any) {
    console.log(e.message)
    console.trace();
    return backupResponse.defaultFunction({
      errorMessage: e.message,
    });
  }
}

export function getLoginComponentStoreFromLoginResponse(
  response: any,
) {
  return {
    [IS_LOGGED_IN_KEY]: response.loggedIn,
    errorMessage: response.error,
    email: response.username,
    [GROUP_DESCRIPTION_TEXT]: response.loggedIn? `Welcome ${response.username}` : "",
    hasAttemptedLogin: true
  };
}

export const authenticationErrorConfig = {
  defaultFunction: (authData: AuthResponse | AuthReducerError) => {
    if (authData instanceof AuthResponse) {
      console.error("Authentication error");
      return new AuthResponse(
        false,
        authData.getData(),
        authData.getErrorMessage().toString(),
      );
    } else {
      return new AuthResponse(false, {}, authData.errorMessage);
    }
  },
};

export const LOGIN_THUNK: BaseThunk = generateApiThunkWithExternalConfig(
  retrieveData,
  authenticationErrorConfig,
)
