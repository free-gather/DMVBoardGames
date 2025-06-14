import { LoginComponent } from "../auth/components/LoginComponent.ts";
import { OpenCreateGroupPageComponent } from "../groups/createGroup/components/OpenCreateGroupPageComponent.ts";
import { CreateGroupPageComponent } from "../groups/createGroup/components/CreateGroupPageComponent.ts";

//This function is for dynamically creating components without having to manually import them from a HTML file
export function getComponent(componentName: string): HTMLElement {
  if (componentName === "login-component") {
    return new LoginComponent();
  }
  if (componentName === "open-create-group-page-component") {
    return new OpenCreateGroupPageComponent();
  }

  if (componentName === "create-group-page-component") {
    return new CreateGroupPageComponent();
  }
  throw Error(
    `Component ${componentName} is not configured to be dynamically created through a JavaScript constructor`,
  );
}
