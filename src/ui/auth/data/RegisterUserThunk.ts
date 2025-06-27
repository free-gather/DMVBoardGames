import type { BaseThunk } from "../../../framework/store/update/BaseThunk.ts";
import { generateApiThunk } from "../../../framework/store/update/api/ApiThunkFactory.ts";
import { API_ROOT } from "../../../utils/params.ts";
import type { ApiRequestConfig } from "../../../framework/store/update/api/types/ApiRequestConfig.ts";

function registerUserConfig(params: any): ApiRequestConfig {
  const requestBody = {
    email: params.username,
    password: params.password,
  };
  return {
    body: JSON.stringify(requestBody),
    method: "POST",
    url: API_ROOT + `/users/register`,
  };
}

export function getLoginComponentStoreFromRegisterResponse(response: any) {
  return {
    errorMessage: response.errorMessage,
    successMessage: response.errorMessage ? "" : "Successfully registered user",
  };
}

const userRegisterErrorConfig = {
  defaultFunction: (response: any) => {
    return {
      errorMessage: response.message,
    };
  },
  defaultFunctionPriority: false,
};

export const REGISTER_USER_THUNK: BaseThunk = generateApiThunk({
  queryConfig: registerUserConfig,
  defaultFunctionConfig: userRegisterErrorConfig,
}).addGlobalStateReducer(() => {
  return {
    isLoggedIn: "false",
  };
});
