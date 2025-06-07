import {
  AUTH_REQUEST_STORE,
  LOGOUT_REQUEST_STORE,
  PASSWORD_INPUT,
  REGISTER_REQUEST_STORE,
  USERNAME_INPUT,
} from "./Constants.js";
import type { EventHandlerThunkConfig } from "../../framework/store/update/event/types/EventHandlerThunkConfig.ts";

export const LOGIN_EVENT_CONFIG: EventHandlerThunkConfig = {
  eventHandler: function () {
    return {
      username:
        (document.getElementById(USERNAME_INPUT) as HTMLInputElement)?.value ??
        "",
      password:
        (document.getElementById(PASSWORD_INPUT) as HTMLInputElement)?.value ??
        "",
    };
  },
  storeToUpdate: AUTH_REQUEST_STORE,
};

export const LOGOUT_EVENT_CONFIG: EventHandlerThunkConfig = {
  eventHandler: function () {
    console.log("Logging out");
  },
  storeToUpdate: LOGOUT_REQUEST_STORE,
};

export const REGISTER_EVENT_CONFIG: EventHandlerThunkConfig = {
  eventHandler: function () {
    console.log("Submitting new user information");

    //TODO: Add logic.
  },
  storeToUpdate: REGISTER_REQUEST_STORE,
};
