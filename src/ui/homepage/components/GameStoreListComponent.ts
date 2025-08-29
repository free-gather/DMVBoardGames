import { BaseTemplateDynamicComponent } from "@bponnaluri/places-js";
import {generateLinkButton} from "../../../shared/components/ButtonGenerator.ts";
import {LOCATIONS_THUNK} from "../data/search/LocationsThunk.ts";

const loadConfig = [{
      componentReducer: (data:any)=>{
        return data.gameStores;
      },
      dataThunk: LOCATIONS_THUNK,
    }]


const template = `
  <link rel="stylesheet" type="text/css" href="/styles/sharedComponentStyles.css"/>
  <style>

  .game-store-list-item p {
    display: inline;
  }
  
    .game-store-list-item > * {
    display: inline-block;
  }
  </style>
`;
export class GameStoreListComponent extends BaseTemplateDynamicComponent {
  constructor() {
    super(loadConfig);
  }

  override getTemplateStyle(): string {
    return template;
  }

  getItemHtml(gameStore: any) {
    return `
    <div id = convention-${gameStore.id} class="game-store-list-item">
     <h3>
        ${generateLinkButton({
          text: gameStore.name,
          url: gameStore.url
        })}
      </h3>
    <p>Location: ${gameStore.location}</p>
    </div>
  `;
  }

  render(data: any) {
    let html = `<div class="ui-section"><h1 class="hideOnMobile">Game Stores</h1>
    <h2 class="showOnMobile">Game stores</h2>`;
    Object.values(data).forEach((item) => {
      const itemHtml = this.getItemHtml(item);
      html += itemHtml;
    });
    return html + "</div>";
  }
}

if (!customElements.get("game-store-list-component")) {
  customElements.define("game-store-list-component", GameStoreListComponent);
}
