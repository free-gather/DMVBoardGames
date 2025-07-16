import { type AuthTokenResponsePassword } from "@supabase/supabase-js";
import type { DefaultApiAction } from "../../../framework/state/update/api/DefaultApiAction.ts";
import { BaseThunk } from "../../../framework/state/update/BaseThunk.ts";
import type { AuthRequest } from "../types/AuthRequest.ts";
import { AuthResponse } from "../types/AuthResponse.ts";
import { generateApiThunkWithExternalConfig } from "../../../framework/state/update/api/ApiThunkFactory.ts";
import { getLocalStorageDataIfPresent } from "../../../framework/utils/LocalStorageUtils.ts";
import { isAfterNow } from "../../../framework/utils/EventDataUtils.ts";
import type { AuthReducerError } from "../types/AuthReducerError.ts";
import { AUTH_TOKEN_KEY } from "../../../shared/params.ts";
import { getSupabaseClient } from "../SupabaseClient.ts";

async function retrieveData(
  params: AuthRequest,
  backupResponse: DefaultApiAction,
): Promise<AuthResponse> {
  try {
    if (
      backupResponse.defaultFunctionPriority &&
      backupResponse.defaultFunction
    ) {
      return backupResponse.defaultFunction();
    }

    const authData = await getLocalStorageDataIfPresent(AUTH_TOKEN_KEY);

    if (authData && isAfterNow(authData.expires_at)) {
      return new AuthResponse(true, authData);
    }

    if(!params.username && !params.password){
      return backupResponse.defaultFunction({});
    }

    const authResponse: AuthTokenResponsePassword =
      await getSupabaseClient().auth.signInWithPassword({
        email: params.username,
        password: params.password,
      });

    if (!authResponse.error) {
      return new AuthResponse(true, authResponse.data);
    }
    if (backupResponse.defaultFunction) {
      return backupResponse.defaultFunction({
        errorMessage: authResponse.error,
      });
    } else {
      throw Error("Authentication error");
    }
  } catch (e: any) {
    console.trace();
    return backupResponse.defaultFunction({
      errorMessage: e.message,
    });
  }
}

export function getLoginComponentStoreFromLoginResponse(
  response: AuthResponse,
) {
  const email = response?.getData()?.user?.email;
  return {
    isLoggedIn: response.isLoggedIn(),
    errorMessage: response.getErrorMessage(),
    email: email,
    successMessage: response.isLoggedIn() ? `Welcome ${email}` : "",
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
).addGlobalStateReducer((loginState: any) => {
  return {
    isLoggedIn: loginState.loggedIn,
  };
});
