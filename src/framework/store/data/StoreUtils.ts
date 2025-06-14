import type { BaseThunk } from "../update/BaseThunk.ts";
import type { BaseDynamicComponent } from "../../components/BaseDynamicComponent.ts";

let globalState: Record<string, string> = {};
let stateCreated = false;

let globalStateSubscribers: Record<string, BaseDynamicComponent[]> = {};

export function getGlobalStateValue(fieldName: string): string {
  if (!(fieldName in globalState)) {
    throw new Error(`Could not find ${fieldName} in global state`);
  }
  return globalState[fieldName];
}
export function setupGlobalState(fields: Record<string, string>) {
  if (stateCreated) {
    //throw new Error("Global state has already been initialized");
  }

  Object.values(fields).forEach(function (fieldName: string) {
    globalState[fieldName] = "";
  });

  stateCreated = true;
}

export function updateGlobalStore(fieldsToUpdate: Record<string, string>) {
  let componentsToUpdate = new Set();
  Object.keys(fieldsToUpdate).forEach(function (fieldName: string) {
    if (!(fieldName in globalState)) {
      throw new Error(
        `Invalid field ${fieldName} for global store. Make sure field is configured as a field name using setupGlobalState`,
      );
    }

    if (
      globalState[fieldName] !== fieldsToUpdate[fieldName] &&
      fieldName in globalStateSubscribers
    ) {
      globalStateSubscribers[fieldName].forEach(function (
        component: BaseDynamicComponent,
      ) {
        componentsToUpdate.add(component);
      });
    }

    globalState[fieldName] = fieldsToUpdate[fieldName];
  });

  componentsToUpdate.forEach(function (component: any) {
    component.updateFromGlobalState(structuredClone(globalState));
  });
}

export function subscribeComponentToGlobalField(
  component: BaseDynamicComponent,
  fieldName: string,
) {
  if (!(fieldName in globalState)) {
    throw new Error(
      `Component id: ${component.componentStoreName} cannot subscribe to field ${fieldName}.
       Make sure the field is configured as a field name using setupGlobalState`,
    );
  }

  if (!(fieldName in globalStateSubscribers)) {
    globalStateSubscribers[fieldName] = [component];
  } else {
    if (!globalStateSubscribers[fieldName].includes(component)) {
      globalStateSubscribers[fieldName].push(component);
    }
  }
}

export function createStore(storeName: string, stores: any) {
  if (!storeName) {
    throw new Error(`createStore must be called with a valid store name`);
  }

  stores[storeName] = {
    data: {},
    subscribers: [],
  };
}

export function hasSubscribers(storeName: string, store: any) {
  return storeName in store && store[storeName].subscribers.length > 0;
}

export function subscribeToStore(storeName: string, item: any, store: any) {
  if (!(storeName in store)) {
    createStore(storeName, store);
  }

  if (!store[storeName].subscribers.includes(item)) {
    store[storeName].subscribers.push(item);
  }
}

export function updateStore(
  storeName: string,
  updateFunction: (a: any) => any,
  storeData: Record<string, any>,
  data: any,
) {
  if (!(storeName in storeData)) {
    createStore(storeName, storeData);
  }

  if (!data) {
    data = storeData[storeName].data;
  }

  const updatedData = updateFunction(data);

  if (!updatedData) {
    throw new Error(
      `Update function for store ${storeName} must return a JSON object`,
    );
  }

  Object.keys(storeData[storeName].data).forEach(function (key) {
    if (!(key in updatedData)) {
      updatedData[key] = storeData[storeName].data[key];
    }
  });
  storeData[storeName].data = updatedData;

  if (storeData[storeName].subscribers.length === 0) {
    console.warn(
      `No subscribers to store ${storeName}. Make sure to call subscribeToReducer in component constructor.`,
    );
    throw Error("Error updating");
  }

  storeData[storeName].subscribers.forEach(function (
    component: BaseDynamicComponent | BaseThunk,
  ) {
    if (!component || !(typeof component.updateStore === "function")) {
      throw new Error(
        `updateStore function not defined for component ${component.constructor.name}`,
      );
    }
    component.updateStore(storeData[storeName].data);
  });
}
