import {
  AUTH_REQUEST_STORE,
  LOGOUT_REQUEST_STORE,
  PASSWORD_INPUT,
  REGISTER_REQUEST_STORE,
  USERNAME_INPUT,
} from "./Constants.js";
import type { EventHandlerThunkConfig } from "../../framework/store/update/event/types/EventHandlerThunkConfig.ts";
import type { EventHandlerData } from "../../framework/store/update/event/types/EventHandlerData.ts";

export const LOGIN_EVENT_CONFIG: EventHandlerThunkConfig = {
  eventHandler: function (params: EventHandlerData) {
    if (!params.shadowRoot) {
      throw new Error("Invalid shadow root for save group event handler");
    }
    return {
      username:
        (params.shadowRoot.getElementById(USERNAME_INPUT) as HTMLInputElement)
          ?.value ?? "",
      password:
        (params.shadowRoot.getElementById(PASSWORD_INPUT) as HTMLInputElement)
          ?.value ?? "",
    };
  },
  requestStoreToUpdate: AUTH_REQUEST_STORE,
};

export const LOGOUT_EVENT_CONFIG: EventHandlerThunkConfig = {
  eventHandler: function () {
    console.log("Logging out");
  },
  requestStoreToUpdate: LOGOUT_REQUEST_STORE,
};

export const REGISTER_EVENT_CONFIG: EventHandlerThunkConfig = {
  eventHandler: function (params: EventHandlerData) {
    if (!params.shadowRoot) {
      throw new Error("Invalid shadow root for save group event handler");
    }
    return {
      username:
        (params.shadowRoot.getElementById(USERNAME_INPUT) as HTMLInputElement)
          ?.value ?? "",
      password:
        (params.shadowRoot.getElementById(PASSWORD_INPUT) as HTMLInputElement)
          ?.value ?? "",
    };
  },
  requestStoreToUpdate: REGISTER_REQUEST_STORE,
};
