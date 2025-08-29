import {
  AbstractPageComponent, ApiActionTypes,
  BaseTemplateDynamicComponent, InternalApiAction,
} from "@bponnaluri/places-js";
import {getUrlParameter} from "@bponnaluri/places-js";
import {
  END_TIME_INPUT,
  EVENT_DESCRIPTION_INPUT, EVENT_LOCATION_INPUT,
  EVENT_NAME_INPUT,
  EVENT_URL_INPUT,
  START_DATE_INPUT,
  START_TIME_INPUT
} from "../../Constants.ts";
import {generateButton} from "../../../../shared/components/ButtonGenerator.ts";
import {generateErrorMessage} from "@bponnaluri/places-js";
import {
  COMPONENT_LABEL_KEY,
  SUCCESS_MESSAGE_KEY
} from "../../../../shared/Constants.ts";

import {GroupPageComponent} from "../../viewGroup/components/GroupPageComponent.ts";
import {getEventDetailsFromForm, validateEventFormData} from "../EventDetailsHandler.ts";
import {API_ROOT} from "../../../../shared/Params.ts";
import {LOGIN_THUNK} from "../../../auth/data/LoginThunk.ts";

const templateStyle = `
  <link rel="stylesheet" type="text/css" href="/styles/sharedComponentStyles.css"/>

  <style>
    #${EVENT_NAME_INPUT} {
      width: 50rem;
    }
    #${EVENT_DESCRIPTION_INPUT} {
      width: 50rem;
      height: 10rem;
    }
    #${EVENT_LOCATION_INPUT} {
      width: 50rem;
    }
  </style>
`;

const loadConfig =  [{
      componentReducer:(data:any)=>{
        return {
          name: "",
          description: "",
          url: "",
          isVisible: data["loggedIn"],
        };
      },
      dataThunk: LOGIN_THUNK
    }];

const CREATE_EVENT_BUTTON_ID = "create-event-button";
const BACK_TO_GROUP_ID = "back-to-group";

export class CreateEventComponent extends BaseTemplateDynamicComponent {
  constructor() {
    super(loadConfig);
  }

  connectedCallback(){
    this.updateData({isVisible: true})
  }

  override attachEventsToShadowRoot(shadowRoot?: any) {
    const self = this;
    shadowRoot?.addEventListener("click",(event:any)=>{
      try {
        if(event.originalTarget.id === BACK_TO_GROUP_ID) {
          AbstractPageComponent.updateRoute(
            GroupPageComponent,
            {"name":getUrlParameter("name")}
          )
        }

        if(event.originalTarget.id === CREATE_EVENT_BUTTON_ID){
          const validationErrors:any = validateEventFormData(self);

          if(validationErrors.errorMessage.length !==0){
            self.updateData(validationErrors);
          } else {
            const eventDetails = getEventDetailsFromForm(self)
            InternalApiAction.getResponseData({
              body: JSON.stringify(eventDetails),
              method: ApiActionTypes.POST,
              url: API_ROOT + `/groups/${eventDetails.groupId}/events/`,
            }).then((response:any)=>{
              if(!response.errorMessage){
                self.updateData({
                  [SUCCESS_MESSAGE_KEY]: "Successfully created event"
                });
              }else {
                self.updateData(response)
              }
            })
          }
        }
      } catch(e:any){
        if(e.message !== `Permission denied to access property "id"`){
          throw e;
        }
      }
    })
  }

  getTemplateStyle(): string {
    return templateStyle;
  }

  render(data: any): string {
    return `   
      ${generateErrorMessage(data.errorMessage)}
      
      ${data[SUCCESS_MESSAGE_KEY] ? `<p class="${SUCCESS_MESSAGE_KEY}">${data[SUCCESS_MESSAGE_KEY]}</p>`: ``}
      <form onsubmit="return false">
        
          <h1>Create board game event for group ${getUrlParameter("name")}</h1>
           <form>
      
        ${this.addShortInput({
          id: EVENT_NAME_INPUT,
          [COMPONENT_LABEL_KEY]: "Event name",
          inputType: "text",
          value: data.name ?? ""
        })}
        <br>
        
        ${this.addTextInput({
          id: EVENT_DESCRIPTION_INPUT,
          [COMPONENT_LABEL_KEY]: "Event description",
          inputType: "text",
          value: data.description ?? ""
        })}
        <br>
        
        ${this.addShortInput({
          id: EVENT_URL_INPUT,
          [COMPONENT_LABEL_KEY]: "Event URL",
          inputType: "text",
          value: data.url ?? ""
        })}
        <br>
         
        ${this.addShortInput({
          id: START_DATE_INPUT,
          [COMPONENT_LABEL_KEY]: "Start date",
          inputType: "text",
          value: ""
        })}
        <br>
        
        ${this.addShortInput({
          id: START_TIME_INPUT,
          [COMPONENT_LABEL_KEY]: "Start time",
          inputType: "text",
          value: ""
        })}
        <br>
   
        ${this.addShortInput({
          id: END_TIME_INPUT,
          [COMPONENT_LABEL_KEY]: "End time",
          inputType: "text",
          value: ""
        })}     
        <br>
    
        ${this.addShortInput({
          id: EVENT_LOCATION_INPUT,
          [COMPONENT_LABEL_KEY]: "Event location",
          inputType: "text",
          value: data.location ?? ""
        })}    
        <br> 
      </form>
      
      <br>
      ${generateButton({
        component: this,
        id: CREATE_EVENT_BUTTON_ID,
        text: "Create event",
      })}
          
          
      ${generateButton({
        component: this,
        id: BACK_TO_GROUP_ID,
        text: "Back to group",
      })}
    `;
  }
}

if (!customElements.get("create-event-component")) {
  customElements.define(
    "create-event-component",
    CreateEventComponent,
  );
}
