import type { GameRestaurant } from "../data/types/GameRestaurant.ts";
import { BaseDynamicComponent } from "../../../framework/components/BaseDynamicComponent.ts";
import { LOCATIONS_THUNK } from "../data/search/LocationsThunk.ts";

export const GAME_RESTAURANT_LIST_STORE = "gameRestaurantListStore";

const loadConfig = {
  thunkReducers: [
    {
      thunk: LOCATIONS_THUNK,
      componentReducerFunction: (data: any) => {
        return data.gameRestaurants;
      },
    },
  ],
};

export class GameRestaurantComponent extends BaseDynamicComponent {
  constructor() {
    super(GAME_RESTAURANT_LIST_STORE, loadConfig);
  }

  getItemHtml(gameRestaurant: GameRestaurant) {
    return `
    <div id = convention-${gameRestaurant.id} class="game-restaurant-list-item">
     <h3>
        <a href=${gameRestaurant.url}>${gameRestaurant.name}</a>
      </h3>
    <p>Location: ${gameRestaurant.location}</p>
    </div>
  `;
  }

  render(data: Record<any, GameRestaurant>) {
    let html = `<h1>Board Game Bars and Cafés</h1>`;
    Object.values(data).forEach((item) => {
      const itemHtml = this.getItemHtml(item);
      html += itemHtml;
    });
    return html;
  }
}

if (!customElements.get("game-restaurant-list-component")) {
  customElements.define(
    "game-restaurant-list-component",
    GameRestaurantComponent,
  );
}
