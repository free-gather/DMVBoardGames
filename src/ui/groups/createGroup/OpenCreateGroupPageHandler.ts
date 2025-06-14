import type { EventHandlerThunkConfig } from "../../../framework/store/update/event/types/EventHandlerThunkConfig.ts";

export const OPEN_CREATE_GROUP_PAGE_CONFIG: EventHandlerThunkConfig = {
  eventHandler: function () {
    window.location.replace(`${window.location.origin}/createGroup.html`);
  },
};
