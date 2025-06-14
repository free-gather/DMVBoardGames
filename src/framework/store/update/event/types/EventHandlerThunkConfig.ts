import type { EventHandlerData } from "./EventHandlerData.ts";

export interface EventHandlerThunkConfig {
  eventHandler: (e: EventHandlerData) => any;
  requestStoreToUpdate?: string;
  componentReducer?: (a: any) => any; //Reducer function if the
}
