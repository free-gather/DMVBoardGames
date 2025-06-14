import type { EventHandlerThunkConfig } from "../../../../framework/store/update/event/types/EventHandlerThunkConfig.ts";
import type { EventHandlerData } from "../../../../framework/store/update/event/types/EventHandlerData.ts";
const NAME = "title";

export const SHOW_INFO_CONFIG: EventHandlerThunkConfig = {
  eventHandler: function (params: EventHandlerData) {
    const store = params.componentStore;

    const groupId = params.targetId;
    const groupName = store.groups[groupId][NAME];

    window.location.replace(
      `${window.location.origin}/groups.html?name=${encodeURIComponent(groupName)}`,
    );
  },
  requestStoreToUpdate: "",
};
