import { BaseTemplateDynamicComponent } from "../../../../framework/components/BaseTemplateDynamicComponent.ts";
import { CREATE_GROUP_CONFIG } from "./CreateGroupPageHandler.ts";
import { CREATE_GROUP_REQUEST_THUNK } from "../data/CreateGroupRequestThunk.ts";
import { OPEN_CREATE_GROUP_PAGE_CONFIG } from "../OpenCreateGroupPageHandler.ts";
import { getGlobalStateValue } from "../../../../framework/store/data/StoreUtils.ts";
import { stateFields } from "../../../utils/InitGlobalStateConfig.ts";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    #openGroupEditPageButton {
      padding: 2rem;
    }
  </style>
  <div>
    <h1>Create group</h1>
</div>
`;

const loadConfig = {
  thunkReducers: [
    {
      thunk: CREATE_GROUP_REQUEST_THUNK,
      componentReducerFunction: function (data: any) {
        const isLoggedIn = getGlobalStateValue(stateFields.LOGGED_IN);

        if (!isLoggedIn) {
          data.isEditing = false;
        }
        return data;
      },
    },
  ],
  globalStateLoadConfig: {
    globalFieldSubscriptions: ["isLoggedIn"],
    waitForGlobalState: "isLoggedIn",
    defaultGlobalStateReducer: function (updates: Record<string, string>) {
      return {
        isVisible: updates["isLoggedIn"],
      };
    },
  },
};

export class CreateGroupPageComponent extends BaseTemplateDynamicComponent {
  constructor() {
    super("create-group-page-component", loadConfig);
  }

  getTemplate(): HTMLTemplateElement {
    return template;
  }

  render(createGroupData: any): string {
    //TODO: Add additional fields

    console.log(createGroupData);
    return `
      <h1>Create group</h1>
      
      <button id ="openGroupEditPageButton" ${this.createClickEvent(OPEN_CREATE_GROUP_PAGE_CONFIG)}>Create group </button>

        <button ${this.createClickEvent(CREATE_GROUP_CONFIG)}>Create group</button>

        </form>
    `;
  }
}

if (!customElements.get("create-group-page-component")) {
  customElements.define(
    "create-group-page-component",
    CreateGroupPageComponent,
  );
}
