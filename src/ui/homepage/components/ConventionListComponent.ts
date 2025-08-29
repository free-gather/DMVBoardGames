import type { Convention } from "../data/types/Convention.ts";
import { BaseTemplateDynamicComponent } from "@bponnaluri/places-js";
import { generateLinkButton} from "../../../shared/components/ButtonGenerator.ts";

import {LOCATIONS_THUNK} from "../data/search/LocationsThunk.ts";

const loadConfig = [{
      componentReducer: (data:any)=>{
        return data.conventions;
      },
      dataThunk: LOCATIONS_THUNK,
    }]


const template = `
  <link rel="stylesheet" type="text/css" href="/styles/sharedComponentStyles.css"/>

   <style>
  .conv-list-item > * {
    display: inline-block;
  }
  
  h3 {
    font-size: 1.5rem;
  }
  
  p {
    padding-left: 0.5rem;
  }


</style>`;

export class ConventionListComponent extends BaseTemplateDynamicComponent {
  constructor() {
    super(loadConfig);
  }

  getItemHtml(convention: Convention) {
    return `
    <div id = convention-${convention.id} class="conv-list-item">
     <h3>
      ${generateLinkButton({
        text: convention.name,
        url: convention.url
      })}
      </h3>
      <p>Days: ${convention.days.join(", ")}</p>
    
    </div>
  `;
  }

  override getTemplateStyle(): string {
    return template;
  }
  render(data: any) {
    let html = `

      <div class="ui-section"><h1 class="hideOnMobile">Upcoming conventions</h1>
      <h2 class="showOnMobile">Upcoming conventions</h2>`;

    Object.values(data).forEach((item:any) => {
      const itemHtml = this.getItemHtml(item);
      html += itemHtml;
    });
    return html + "</div>";
  }
}

if (!customElements.get("convention-list-component")) {
  customElements.define("convention-list-component", ConventionListComponent);
}
