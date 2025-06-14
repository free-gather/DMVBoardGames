import type { ApiRequestConfig } from "../../../../framework/store/update/api/types/ApiRequestConfig.ts";
import { API_ROOT } from "../../../../utils/params.ts";
import { generateApiThunk } from "../../../../framework/store/update/api/ApiThunkFactory.ts";
import { ApiActionTypes } from "../../../../framework/store/update/api/types/ApiActionTypes.ts";
import { SAVE_GROUP_REQUEST_STORE } from "../../Constants.ts";
import { getAccessTokenIfPresent } from "../../../auth/AuthUtils.ts";
import { AUTH_TOKEN_HEADER_KEY } from "../../../auth/Constants.ts";
import type { UpdateGroupRequest } from "./types/UpdateGroupRequest.ts";

function updateGroupRequestThunk(
  requestParams: UpdateGroupRequest,
): ApiRequestConfig {
  let headers: Record<string, string> = {};
  const authData = getAccessTokenIfPresent();
  if (authData) {
    headers[AUTH_TOKEN_HEADER_KEY] = authData;
  }

  return {
    body: JSON.stringify(requestParams),
    method: ApiActionTypes.PUT,
    headers: headers,
    url: API_ROOT + `/groups/?name=${encodeURIComponent(requestParams.name)}`,
  };
}

const defaultFunctionConfig = {
  defaultFunction: function () {
    return {};
  },
  defaultFunctionPriority: false,
};

export const UPDATE_GROUP_REQUEST_THUNK = generateApiThunk({
  queryConfig: updateGroupRequestThunk,
  defaultFunctionConfig: defaultFunctionConfig,
  requestStoreName: SAVE_GROUP_REQUEST_STORE,
});
