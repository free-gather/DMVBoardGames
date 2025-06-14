import type { EventHandlerThunkConfig } from "../../../../framework/store/update/event/types/EventHandlerThunkConfig.ts";
import {
  CREATE_GROUP_REQUEST_STORE,
  GROUP_NAME_INPUT,
} from "../../Constants.ts";

export const CREATE_GROUP_CONFIG: EventHandlerThunkConfig = {
  eventHandler: function (params): any {
    if (!params.shadowRoot) {
      throw new Error("Invalid shadow root for save group event handler");
    }

    return {
      name:
        (
          params.shadowRoot.getElementById(
            GROUP_NAME_INPUT,
          ) as HTMLTextAreaElement
        )?.value ?? "",
    };
  },
  requestStoreToUpdate: CREATE_GROUP_REQUEST_STORE,
  componentReducer: function (data: any) {
    //TODO: Update logic
    return data;
  },
};
