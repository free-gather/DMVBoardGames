/*
  These imports are to load the Web Components that will be displayed.
 */

// @ts-ignore
import {GameRestaurantListComponent} from "./GameRestaurantListComponent.ts";
// @ts-ignore
import {GameStoreListComponent} from "./GameStoreListComponent.ts";
// @ts-ignore
import {ConventionListComponent} from "./ConventionListComponent.ts";
// @ts-ignore
import {GroupEventComponent} from "../../groups/viewGroup/components/GroupEventComponent.ts";
// @ts-ignore
import {GroupListComponent} from "./group-list/GroupListComponent.ts";
// @ts-ignore
import {GroupSearchComponent} from "./group-search/GroupSearchComponent.ts";
// @ts-ignore
import {OpenCreateGroupPageComponent} from "./OpenCreateGroupPageComponent.ts";

import {generateButton} from "../../../shared/components/ButtonGenerator.ts";

import {BaseDynamicComponent} from "@bponnaluri/places-js";

const CONVENTIONS_ID = "convention-list";
const EVENT_SEARCH_ID ="group-search";
const GAME_RESTAURANTS_ID="game-restaurants";
const GAME_STORES_ID="game-stores";

const COMPONENTS_WITH_EVENTS:string[] = ['group-search-component','group-list-component','open-create-group-component']
export class HomepageComponent extends BaseDynamicComponent {
  constructor(){
    super();
  }

  connectedCallback() {
    this.updateData({
      hideEvents: false,
      hideConventions: true,
      hideRestaurants: true,
      hideGameStores: true
    });
    const self = this;

    this.addEventListener("click", function (event: any) {
      event.preventDefault();


      const targetId = event.originalTarget.id;

      const targetComponentId = event.srcElement.id || event.srcElement.localName;
      if (COMPONENTS_WITH_EVENTS.includes(targetComponentId) && event.srcElement instanceof BaseDynamicComponent)  {
        event.target.handleClickEvents(event);
      }
      else {
        if ([CONVENTIONS_ID, EVENT_SEARCH_ID, GAME_RESTAURANTS_ID, GAME_STORES_ID].includes(targetId)) {
          self.updateData({
            hideEvents: targetId !== EVENT_SEARCH_ID,
            hideConventions: targetId !== CONVENTIONS_ID,
            hideRestaurants: targetId !== GAME_RESTAURANTS_ID,
            hideGameStores: targetId !== GAME_STORES_ID
          })
        }
      }
    })
  }

  render(data:any){
    return `
        <div class="ui-section">
        <open-create-group-component>
        </open-create-group-component>
        <nav>
          <div id="nav-container">
            <div>Click for more info about</div>
            
            <div class = "homepage-default-action-div">
              <div class = "image-div">  
                <img src="/assets/house.png">
              </div>
              <div>
                ${data.hideEvents || data.showAllButtons ? generateButton({
                  component: this,
                  id: EVENT_SEARCH_ID,
                  text: "Events",
                }): ``} 
                  
                ${data.hideConventions ? generateButton({
                  component: this,
                  id: CONVENTIONS_ID,
                  text: "Conventions",
                }): ``}       
             
                ${data.hideGameStores ? generateButton({
                  component: this,
                  id: GAME_STORES_ID,
                  text: "Game Stores",
                }): ``}  
             
                ${data.hideRestaurants ? generateButton({
                  component: this,
                  id: GAME_RESTAURANTS_ID,
                  text: "Bars and Cafés",

                }): ``} 
              </div>
            
            </div>
             
          </div>
        </nav>
      </div>
    
   
      <div class="section-separator-medium"></div>

      <div data-container="root">
        <group-search-component id="group-search-component" class="page-section" isVisible=${!data.hideEvents}>
        </group-search-component>
    
        <div class="section-separator-medium"></div>
    
        ${data && !data.hideEvents ? `
        <div id="group-list" class="page-section">
          <group-list-component></group-list-component>
        </div> `: ''}
    

        ${data && !data.hideConventions ? `
        <div id="convention-list" class="page-section">
          <convention-list-component data-test="testing">
            <p></p>
          </convention-list-component>
        </div>
        ` : ''}
    
 
      ${data && !data.hideRestaurants ?`
        <div id="game-restaurant-list" class="page-section">
          <game-restaurant-list-component></game-restaurant-list-component>
        </div>` : ''}
    
      ${data && !data.hideGameStores ? `
        <div id="game-store" class="page-section">
          <game-store-list-component></game-store-list-component>
        </div>` : ''}
      </div>
    </div>
    `
  }
}

if (!customElements.get("homepage-component")) {
  customElements.define("homepage-component", HomepageComponent);
}
