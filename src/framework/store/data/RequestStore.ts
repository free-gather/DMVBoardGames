import { createStore, hasSubscribers, subscribeToStore } from "./StoreUtils.js";
import { addLoadFunction } from "./InitStoreManager.js";
import type { DefaultApiAction } from "../update/api/DefaultApiAction.ts";
import type { BaseThunk } from "../update/BaseThunk.ts";
import type {
  ComponentLoadConfig,
  RequestStoreItem,
} from "../../components/types/ComponentLoadConfig.ts";
import type { ApiRequestConfig } from "../update/api/types/ApiRequestConfig.ts";
import { ApiActionTypes } from "../update/api/types/ApiActionTypes.ts";

const stores: Record<string, any> = {};
const responseCache: Record<string, any> = {};
const requestsWithoutCache = new Set<string>();
const DEFAULT_API_ERROR_RESPONSE = function (responseData: any) {
  throw new Error(JSON.stringify(responseData, null, 2));
};

export const DEFAULT_SUCCESS_RESPONSE = { status: 200 };
export function createRequestStoreWithData(
  storeName: string,
  dataSource: BaseThunk,
  initStore: () => any = () => {
    return { load: true };
  },
) {
  createStore(storeName, stores);
  responseCache[storeName] = {};

  subscribeToRequestStore(storeName, dataSource);
  updateRequestStore(storeName, initStore, null);
}

export function subscribeToRequestStore(storeName: string, item: any) {
  subscribeToStore(storeName, item, stores);
  if (!responseCache[storeName]) {
    responseCache[storeName] = {};
  }
}

export function hasRequestStore(storeName: string): boolean {
  return storeName in stores;
}

export function updateRequestStoreAndClearCache(
  storeName: string,
  params: Record<string, string>,
) {
  responseCache[storeName] = {};
  updateRequestStore(
    storeName,
    () => {
      return params;
    },
    null,
  );
}

/**
 * Updates the request store for an API call. This should only be called upon a component's initial render or when
 *  a user action requires a request store
 * @param storeName
 * @param updateFunction
 * @param data
 */
export function updateRequestStore(
  storeName: string,
  updateFunction: (a?: any) => any,
  data?: any,
) {
  if (!(storeName in stores)) {
    createStore(storeName, stores);
  }

  if (!data) {
    data = stores[storeName].data;
  }

  stores[storeName].data = {
    ...updateFunction(data),
  };

  stores[storeName].subscribers.forEach(function (item: any) {
    const requestData = stores[storeName].data;

    if (item.dispatchers.length === 0) {
      throw new Error(
        `No dispatchers for the response associated with: ${storeName} Make sure a component is subscribed to the store thunk`,
      );
    }

    //TODO: If a response would invalidate a cache item, do a page refresh or clear the whole cache.
    if (
      requestData &&
      Object.keys(requestData).length > 0 &&
      JSON.stringify(requestData) in responseCache[storeName]
    ) {
      item.updateStore(responseCache[storeName][JSON.stringify(requestData)]);
    } else {
      item.retrieveData(requestData).then((response: any) => {
        if (!requestsWithoutCache.has(storeName)) {
          responseCache[storeName][JSON.stringify(requestData)] = response;
        }
        item.updateStore(response);
      });
    }
  });
}

export function hasRequestStoreSubscribers(storeName: string): boolean {
  return hasSubscribers(storeName, stores);
}

export function initRequestStore(config: ComponentLoadConfig) {
  function getRequestData() {
    return config.onLoadRequestData;
  }

  const onLoadConfig = config.onLoadStoreConfig;
  if (!onLoadConfig) {
    return;
  }

  if (onLoadConfig.disableCache) {
    requestsWithoutCache.add(onLoadConfig.storeName);
  }
  createRequestStoreWithData(
    onLoadConfig.storeName,
    onLoadConfig.dataSource,
    getRequestData,
  );

  if (config.requestStoresToCreate) {
    config.requestStoresToCreate.forEach(function (
      requestStoreItem: RequestStoreItem,
    ) {
      createStore(requestStoreItem.storeName, stores);
      responseCache[requestStoreItem.storeName] = {};
      subscribeToRequestStore(
        requestStoreItem.storeName,
        requestStoreItem.dataSource,
      );
    });
  }

  if (config.onLoadRequestConfig) {
    config.onLoadRequestConfig.forEach(function (
      requestStoreItem: RequestStoreItem,
    ) {
      createRequestStoreWithData(
        requestStoreItem.storeName,
        requestStoreItem.dataSource,
      );
    });
  }
}

export function initRequestStoresOnLoad(config: ComponentLoadConfig) {
  const onLoadConfig = config.onLoadStoreConfig;
  if (!onLoadConfig) {
    return;
  }

  addLoadFunction(onLoadConfig.storeName, function () {
    initRequestStore(config);
  });
}

export async function getResponseData(
  queryConfig: ApiRequestConfig,
  mockSettings?: DefaultApiAction,
) {
  const url = queryConfig.url;
  const useDefault = mockSettings?.defaultFunctionPriority;

  try {
    if (!useDefault) {
      //The replace call is a workaround for an issue with url strings containing double quotes"
      const response = await fetch(url.replace(/"/g, ""), {
        method: queryConfig.method ?? ApiActionTypes.GET,
        headers: queryConfig.headers,
        body: queryConfig.body,
      });
      if (response.status !== 200) {
        console.warn("Did not retrieve data from API. Mock data will be used");

        let message = "";

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          message = await response.json();
        } else {
          if (response.status === 404) {
            message = `Endpoint ${url} not found`;
          } else {
            message = await response.text();
          }
        }

        const responseData: any = {
          status: response.status,
          message: message,
          endpoint: url,
        };

        return mockSettings?.defaultFunction
          ? mockSettings?.defaultFunction(responseData)
          : DEFAULT_API_ERROR_RESPONSE(responseData);
      }

      const contentType = response.headers.get("content-type");
      if (contentType === "application/json") {
        const result = await response.json();
        return result;
      }

      return DEFAULT_SUCCESS_RESPONSE;
    }
  } catch (e: any) {
    const responseData: any = {
      status: null,
      message: e.message,
      endpoint: url,
    };

    return mockSettings?.defaultFunction
      ? mockSettings?.defaultFunction(responseData)
      : DEFAULT_API_ERROR_RESPONSE(responseData);
  }
  return mockSettings?.defaultFunction ? mockSettings.defaultFunction() : {};
}
