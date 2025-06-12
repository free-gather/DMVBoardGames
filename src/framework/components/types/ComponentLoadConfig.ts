import type { BaseThunk } from "../../store/update/BaseThunk.ts";

export type RequestStoreItem = {
  storeName: string;
  dataSource: BaseThunk;
  disableCache?: boolean;
};

export type ThunkReducerConfig = {
  thunk: BaseThunk;
  componentReducerFunction: (a: any) => any;
  globalStoreReducer?: (a: any) => any;
  reducerField?: string;
};

export type ComponentLoadConfig = {
  featureFlagEnabled?: () => boolean;
  onLoadStoreConfig?: RequestStoreItem;
  onLoadRequestData?: any;
  onLoadInitStore?: () => any;
  onLoadRequestConfig?: RequestStoreItem[];
  requestStoresToCreate?: RequestStoreItem[];
  thunkReducers?: ThunkReducerConfig[];
  globalFieldSubscriptions?: string[];
};

export const validComponentLoadConfigFields = [
  "onLoadStoreConfig",
  "onLoadRequestData",
  "onLoadInitStore",
  "onLoadRequestConfig",
  "requestStoresToCreate",
  "thunkReducers",
  "globalFieldSubscriptions",
];
