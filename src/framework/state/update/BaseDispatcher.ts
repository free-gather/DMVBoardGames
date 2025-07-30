/*
 Updates store after an API response is returned
 */
import { updateComponentStore } from "../data/ComponentStore.ts";
import { hasRequestStore, updateRequestStore } from "../data/RequestStore.ts";

export class BaseDispatcher {
  storeField: string;
  reducerUpdate: (a: any) => any;
  responseField?: string;

  constructor(
    storeName: string,
    storeUpdate?: (a: any) => any,
    responseField?: string,
  ) {
    this.storeField = storeName;
    this.responseField = responseField;

    if(storeUpdate){
      this.reducerUpdate = storeUpdate;
    } else {
      this.reducerUpdate = function(data:any){
        return data;
      }
    }
  }

  updateStore(response: any) {
    const baseDispatcher: BaseDispatcher = this;
    const responseData = this.responseField
      ? response[this.responseField]
      : response;

    if (hasRequestStore(baseDispatcher.storeField)) {
      updateRequestStore(
        baseDispatcher.storeField,
        baseDispatcher.reducerUpdate,
        responseData,
      );
    } else {
      updateComponentStore(
        baseDispatcher.storeField,
        baseDispatcher.reducerUpdate,
        responseData,
      );
    }
  }
}
