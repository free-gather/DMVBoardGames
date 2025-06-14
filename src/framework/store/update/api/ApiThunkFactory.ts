import type { DefaultApiAction } from "./DefaultApiAction.ts";
import { BaseThunk } from "../BaseThunk.ts";
import { ExternalAction } from "./ExternalAction.ts";
import { BaseGetAction } from "./BaseGetAction.ts";
import type { ApiRequestConfig } from "./types/ApiRequestConfig.ts";
import { subscribeToRequestStore } from "../../data/RequestStore.ts";

export type ApiThunkConfig = {
  queryConfig: (a: any) => ApiRequestConfig;
  defaultFunctionConfig: DefaultApiAction;
  requestStoreName?: string;
};

export function generateApiThunk(config: ApiThunkConfig) {
  const getAction = new BaseGetAction(
    config.queryConfig,
    config.defaultFunctionConfig,
  );

  const apiThunk = new BaseThunk(getAction);
  if (config.requestStoreName) {
    console.log(`Subscribing to request store ${config.requestStoreName}`);
    subscribeToRequestStore(config.requestStoreName, apiThunk);
  }
  return apiThunk;
}

export function generateApiThunkWithExternalConfig(
  retrieveData: (a: any, b: DefaultApiAction) => Promise<any>,
  defaultResponse: DefaultApiAction,
) {
  const action = new ExternalAction(retrieveData, defaultResponse);
  return new BaseThunk(action);
}
