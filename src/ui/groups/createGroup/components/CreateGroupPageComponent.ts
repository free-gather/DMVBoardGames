import {
  GROUP_DESCRIPTION_INPUT,
  GROUP_NAME_INPUT,
  GROUP_URL_INPUT,
} from "../../Constants.ts";
import {generateButton} from "../../../../shared/components/ButtonGenerator.ts";
import {ApiActionTypes, generateErrorMessage, InternalApiAction} from "@bponnaluri/places-js";
import {
  IS_LOGGED_IN_KEY,
  SUCCESS_MESSAGE_KEY
} from "../../../../shared/Constants.ts";
import {BaseTemplateDynamicComponent} from "@bponnaluri/places-js";
import {LOGIN_THUNK} from "../../../auth/data/LoginThunk.ts";
import { API_ROOT } from "../../../../shared/Params.ts";

const templateStyle = `
  <link rel="stylesheet" type="text/css" href="/styles/sharedComponentStyles.css"/>

  <style>
    #group-description-input {
      height:500px;
      width: 800px;
      margin-bottom: 1rem;
    }
    #create-group-page-container {
      padding-left: 1rem;
    }
  </style>
`;

const loadConfig = [{
      componentReducer:(data:any)=>{
        return {
          name: "",
          description: "",
          url: "",
          [IS_LOGGED_IN_KEY]: data.loggedIn
        }
      },
      dataThunk:LOGIN_THUNK
    }];

const CREATE_GROUP_BUTTON_ID = "create-group-button-id";

export class CreateGroupPageComponent extends BaseTemplateDynamicComponent {
  constructor() {
    super(loadConfig);
  }

  getTemplateStyle(): string {
    return templateStyle;
  }

  override attachEventsToShadowRoot(shadowRoot:ShadowRoot){

    var self = this;
    shadowRoot?.getElementById('create-group-form')?.addEventListener('submit',(event:any)=>{
       event.preventDefault();


       const data = event.target.elements;

       const params = {
         id: self.componentState.id,
         name: data[0].value,
         description: data[1].value,
         url: data[2].value
       }

      InternalApiAction.getResponseData({
        body: JSON.stringify(params),
        method: ApiActionTypes.POST,
        url: API_ROOT + `/groups/`,
      }).then((data:any)=>{

        console.log(data)
        console.log(Object.keys(data))
        if (data.errorMessage) {
          console.log("error")
          console.log(data.errorMessage)
          self.updateData({
            errorMessage: data.errorMessage,
            [SUCCESS_MESSAGE_KEY]: "",
          });
        } else {
          console.log("No error")
          self.updateData({
            errorMessage: "",
            [SUCCESS_MESSAGE_KEY]: "Successfully created group",
          });
        }
      })
     })
  }

  render(createGroupData: any): string {

    return `
      <div id="create-group-page-container">
        <h1>Create board game group</h1>
        
          ${
            createGroupData.isLoggedIn
              ? `
                <form id="create-group-form">
                
                  <label>Group name</label>
                  <input
                    name=${GROUP_NAME_INPUT}
                    />${createGroupData.name}
                  </input>
                  
                  <br>
                  <label>Group url</label>
                  <input
                    name=${GROUP_URL_INPUT}
                    />
                  ${createGroupData.url}
                  </input>
                  
             
                  <br>
                  <label>Group description</label>
                  <br>
                  <textarea
                    id=${GROUP_DESCRIPTION_INPUT}
                    name=${GROUP_DESCRIPTION_INPUT}
                    />
                  ${createGroupData.description}
                  </textarea>
                  <br>
          
      
                 ${generateButton({
                  component: this,
                  id: CREATE_GROUP_BUTTON_ID,
                  type:"submit",
                  text: "Create group"
                })}
             
                </form>
               
                <p class="${SUCCESS_MESSAGE_KEY}">${createGroupData?.[SUCCESS_MESSAGE_KEY]?.trim() ?? ""}</p>
                ${generateErrorMessage(createGroupData.errorMessage)}
              `
              : `<p>You must log in to create a group </p>`
          }    
     </div> 
     `;

  }
}

if (!customElements.get("create-group-page-component")) {
  customElements.define(
    "create-group-page-component",
    CreateGroupPageComponent,
  );
}
