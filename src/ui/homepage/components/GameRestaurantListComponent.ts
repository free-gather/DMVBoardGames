import type { GameRestaurant } from "../data/types/GameRestaurant.ts";
import { BaseTemplateDynamicComponent } from "@bponnaluri/places-js";
import {generateLinkButton} from "../../../shared/components/ButtonGenerator.ts";
import {LOCATIONS_THUNK} from "../data/search/LocationsThunk.ts";


const loadConfig = [{
      componentReducer: (data:any)=>{
        return data.gameRestaurants;
      },
      dataThunk: LOCATIONS_THUNK,
    }]


const template = `
  <link rel="stylesheet" type="text/css" href="/styles/sharedComponentStyles.css"/>

  <style>
    .game-restaurant-list-item > * {
      display: inline-block;
    }
  </style>
`;
export class GameRestaurantListComponent extends BaseTemplateDynamicComponent {
  constructor() {
    super(loadConfig);
  }

  override getTemplateStyle(): string {
    return template;
  }

  getItemHtml(gameRestaurant: GameRestaurant) {
    return `
    <div id = convention-${gameRestaurant.id} class="game-restaurant-list-item">
     <h3>
        ${generateLinkButton({
          text: gameRestaurant.name,
          url: gameRestaurant.url
        })}
      </h3>
    <p>Location: ${gameRestaurant.location}</p>
    </div>
  `;
  }

  render(data: any) {

    let html = `<div class ="ui-section">
    <h1 class="hideOnMobile">Board Game Bars and Cafés</h1>
    <h2 class="showOnMobile">Board Game Bars and Cafés</h2>
    `;
    Object.values(data).forEach((item:any) => {
      const itemHtml = this.getItemHtml(item);
      html += itemHtml;
    });
    return html + `</div>`;
  }
}

if (!customElements.get("game-restaurant-list-component")) {
  customElements.define(
    "game-restaurant-list-component",
    GameRestaurantListComponent,
  );
}
