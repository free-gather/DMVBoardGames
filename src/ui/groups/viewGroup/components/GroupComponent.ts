import { getParameter } from "../../../../framework/utils/urlParmUtils.ts";
import {
  GET_GROUP_REQUEST_STORE,
  GROUP_COMPONENT_STORE,
  GROUP_DESCRIPTION_INPUT,
  GROUP_NAME_INPUT,
  GROUP_NAME_PARAM,
  GROUP_URL_INPUT,
} from "../../Constants.js";
import { GROUP_REQUEST_THUNK } from "../data/GroupRequestThunk.ts";

import { createJSONProp } from "../../../../framework/components/utils/ComponentUtils.ts";
import type { GroupPageData } from "../data/types/GroupPageData.ts";
import type { Event } from "../../../events/data/types/Event.ts";
import { BaseTemplateDynamicComponent } from "../../../../framework/components/BaseTemplateDynamicComponent.ts";
import {
  EDIT_GROUP_EVENT_CONFIG,
  SAVE_GROUP_CONFIG,
} from "./GroupPageHandlers.ts";
import { UPDATE_GROUP_REQUEST_THUNK } from "../data/UpdateGroupThunk.ts";
import { stateFields } from "../../../utils/InitGlobalStateConfig.ts";
import { getGlobalStateValue } from "../../../../framework/store/data/StoreUtils.ts";

const SAVE_GROUP_SUCCESS_PROP = "saveGroupSuccess";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    .group-summary {
      margin-left: 2rem;
    }
    .group-description {
      background: hsl(from var(--clr-lighter-blue) h s l / 0.1);
      border-radius: 10px;
      color: var(--clr-dark-blue);
      font-size: 1.25rem;
      font-weight:600;
      margin-left: 1rem;
      padding: 2rem;
    }
    .group-title {
       margin-left: 2rem;
    }
    .group-data-input {
      height:24px;
      font-size:24px;
      display: block;
    }
    
    #group-url-input {
      width: 600px;
    }
    
    #group-description-input {
      height: 500px;
      width: 800px;
    }
    
  </style>
  <div></div>
`;

const loadConfig = {
  onLoadStoreConfig: {
    storeName: GET_GROUP_REQUEST_STORE,
    dataSource: GROUP_REQUEST_THUNK,
  },
  onLoadRequestData: {
    name: getParameter(GROUP_NAME_PARAM),
  },
  thunkReducers: [
    {
      thunk: GROUP_REQUEST_THUNK,
      componentReducerFunction: function (data: any) {
        const isLoggedIn = getGlobalStateValue(stateFields.LOGGED_IN);

        if (!isLoggedIn) {
          data.isEditing = false;
        }
        data[SAVE_GROUP_SUCCESS_PROP] = false;
        return data;
      },
    },
    {
      thunk: UPDATE_GROUP_REQUEST_THUNK,
      componentReducerFunction: function () {
        return {
          isEditing: false,
          SAVE_GROUP_SUCCESS_PROP: true,
        };
      },
    },
  ],
  globalStateLoadConfig: {
    globalFieldSubscriptions: ["isLoggedIn"],
    waitForGlobalState: "isLoggedIn",
  },
};

export class GroupComponent extends BaseTemplateDynamicComponent {
  constructor() {
    super(GROUP_COMPONENT_STORE, loadConfig);
  }

  getTemplate(): HTMLTemplateElement {
    return template;
  }

  render(groupData: GroupPageData): string {
    if (!groupData.permissions) {
      return `<h1>Failed to load group ${getParameter(GROUP_NAME_PARAM)}</h1>`;
    }

    return `

     ${groupData.saveGroupSuccess ? `<h2>Group update sucessful</h2>` : ``}
    ${
      !groupData.isEditing
        ? `<div class="group-title">
        <h1>Group link: <a href=${groupData.url}>${groupData.name}</a></h1>

        ${groupData.permissions.userCanEdit ? `<button class="group-edit-button" ${this.createClickEvent(EDIT_GROUP_EVENT_CONFIG)}>Edit group</button>` : ``}
        </div>
    
        <div class="group-summary">
        <p class="group-description">${groupData.summary}</p>
        </div>`
        : `
        <h1>Editing group information</h1>
        
        <form >
        
          <label for="group-name">Group Name</label>
          <input 
            class="group-data-input"
            type="text" id=${GROUP_NAME_INPUT}
            value="${groupData.name}"
            name=${GROUP_NAME_INPUT}/>
          
          <label for="group-url">Group URL:</label>
          <input class="group-data-input" id = "group-url-input" type="text" value= ${groupData.url} id=${GROUP_URL_INPUT} name=${GROUP_URL_INPUT}/> 
          
          <label for="group-description">Group Description</label>
          <textarea class="group-data-input" id = "group-description-input" type="text" id=${GROUP_DESCRIPTION_INPUT} name=${GROUP_DESCRIPTION_INPUT}> ${groupData.summary}
          </textarea>
    
          <button ${this.createSubmitEvent(SAVE_GROUP_CONFIG)}>Save updates</button>
        </form>
      
      `
    }

      ${
        groupData.eventData.length === 0
          ? `<p id="no-event">Click on group link above for event information</p>`
          : `${groupData.eventData
              .map((event: Event) => {
                return `
              <event-component
                key = ${groupData.id + "event-" + event.id}
                data =${createJSONProp(event)}
              >
    
              </event-component>

            `;
              })
              .join(" ")}
              <p>Only events for the next 30 days will be visible. See the group page for information on other events.</p>
              `
      }
      
    `;
  }
}

if (!customElements.get("group-component")) {
  customElements.define("group-component", GroupComponent);
}
