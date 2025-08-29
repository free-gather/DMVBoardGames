import {generateButton} from "../../../shared/components/ButtonGenerator.ts";
import {IS_LOGGED_IN_KEY} from "../../../shared/Constants.ts";
import {
  AbstractPageComponent,
} from "@bponnaluri/places-js";
import {BaseDynamicComponent} from "@bponnaluri/places-js";
import {LOGIN_THUNK} from "../../auth/data/LoginThunk.ts";
import {CreateGroupPageComponent} from "../../groups/createGroup/components/CreateGroupPageComponent.ts";


const loadConfig = [{
      componentReducer:(data:any)=>{
        return {
          [IS_LOGGED_IN_KEY]: data?.loggedIn
        }
      },
      dataThunk:LOGIN_THUNK
    }]


const CREATE_GROUP_BUTTON_ID = "open-create-group-page-button-id"
export class OpenCreateGroupPageComponent extends BaseDynamicComponent {

  constructor() {
    super(loadConfig);
  }

  connectedCallback(){
    this.addEventListener("click", (event:any)=>{
      event.preventDefault();
      if(event.originalTarget.id === CREATE_GROUP_BUTTON_ID){
        AbstractPageComponent.updateRoute(CreateGroupPageComponent, event.params)
      }
      event.stopPropagation();
    });
  }


  render(data: any){
    if(!data[IS_LOGGED_IN_KEY]){
      return ''
    }
    return `
        <div id="open-create-group-div" class= "homepage-default-action-div">
        <div class = "image-div">  
          <img src="/assets/house.png">
        </div>
        ${generateButton({
          component: this,
          id: CREATE_GROUP_BUTTON_ID,
          text: "Create group",
        })}
        </div>
    `
  }
}

if (!customElements.get("open-create-group-component")) {
  customElements.define("open-create-group-component", OpenCreateGroupPageComponent);
}