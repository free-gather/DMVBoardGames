import { NavbarComponent } from "../../static/navbarComponent.ts";
import { LoginComponent } from "../../auth/components/LoginComponent.ts";
import { getComponent } from "../ComponentRegistry.ts";

export class PageComponent extends HTMLElement {
  constructor() {
    super();

    const componentName: string = this.getAttribute("componentName") ?? "";

    this.appendChild(new NavbarComponent());
    this.appendChild(new LoginComponent());
    this.appendChild(getComponent(componentName));
  }
}

if (!customElements.get("page-component")) {
  customElements.define("page-component", PageComponent);
}
