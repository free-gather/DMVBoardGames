import {
  DAYS_IN_WEEK,
  DEFAULT_SEARCH_PARAMETER, DISTANCE_OPTIONS, SEARCH_CITY_ID,
  SEARCH_FORM_ID
} from "./Constants.ts";

import {
  CITY_LIST_THUNK,
  updateCities,
} from "../../data/search/CityListThunk.ts";

import { BaseTemplateDynamicComponent } from "@bponnaluri/places-js";
import {generateButton} from "../../../../shared/components/ButtonGenerator.ts";
import type {DropdownConfig} from "@bponnaluri/places-js";
import {getDisplayName} from "../../../../shared/DisplayNameConversion.ts";

import {
  DEFAULT_PARAMETER_DISPLAY_KEY,
  DEFAULT_PARAMETER_KEY,
} from "../../../../shared/Constants.ts";
import {GROUP_SEARCH_THUNK} from "../../data/search/GroupSearchThunk.ts";
const loadConfig = [{
      componentReducer: updateCities,
      dataThunk:CITY_LIST_THUNK,
      fieldName: "cityList"
    }];

const template = `
  <link rel="stylesheet" type="text/css" href="/styles/sharedComponentStyles.css"/>

  <style>
  
  #search-form {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 4rem;
    justify-content: left;
    padding-bottom: 5px;
  }
  
  #search-form select {
    border-color: var(--clr-light-blue);
    border-radius: 5px;
    color: var(--clr-light-blue);
    cursor: pointer;
    padding: 0.25rem;
  }
  
  select {
    width:10rem;
  }
  
  .searchDropdownLabel {
    display: inline-block;
    width: 13rem;
  }
    
  #searchInputDiv {
    align-items: center;
    display:flex;
    height:3.5rem;
  }
  
  #searchInputDiv img {
    padding-top:20px;
  }
  
  .image-div {
    padding-right:0.5rem;
  }
  
  @media screen and (width < 32em) {
    #search-form {
      gap: 2rem;
    }
    
    .search-input-wrapper {
      align-items: center;
      justify-content: center;
    }
    
    button {
      justify-content: center;
    }
    

  }
</style>
`;

const SEARCH_BUTTON_ID:string = "search-button-id";
const SEARCH_DISTANCE_ID:string = "search-distance-id";
const SEARCH_DAYS_ID:string = "search-days-id";

export class GroupSearchComponent extends BaseTemplateDynamicComponent {

  constructor() {
    super(loadConfig);
  }

  override getTemplateStyle(): string {
    return template;
  }

  handleClickEvents(event:any){
    if(event.originalTarget.id === SEARCH_BUTTON_ID) {
      const searchParams:any = {
        location: this.componentState.location,
        day: this.componentState.day,
        distance: this.componentState.distance
      };
      GROUP_SEARCH_THUNK.getData(searchParams)
    }
  }

  override attachEventHandlersToDom(shadowRoot?: any) {
    const self = this;

    shadowRoot?.getElementById(SEARCH_FORM_ID)?.addEventListener("change", (event:any)=>{
      const eventTarget = event.originalTarget.id;
      if(eventTarget === SEARCH_DAYS_ID){
        self.updateData({
          day: (event.originalTarget as HTMLInputElement).value,
        })
      } else if(eventTarget === SEARCH_CITY_ID){
        self.updateData({
          location: (event.originalTarget  as HTMLInputElement).value,
        })
      } else if(eventTarget === SEARCH_DISTANCE_ID) {
        self.updateData({
          distance: (event.originalTarget as HTMLInputElement).value
        })
      }
    })
  }

  render(eventSearchStore: any) {

    if(!this.getAttribute("isVisible") || this.getAttribute("isVisible")=== "false"){
      return ''
    }
    return `
   
      <div id="event-search" class="ui-section">
        <form id=${SEARCH_FORM_ID}>
          <div id='search-input-wrapper'>
             <div>
              ${this.getDropdownHtml({
              label:"Select event day:",
              id: SEARCH_DAYS_ID,
              name: "days",
              data: DAYS_IN_WEEK,
              selected: eventSearchStore.day,
              [DEFAULT_PARAMETER_KEY]:DEFAULT_SEARCH_PARAMETER,
              [DEFAULT_PARAMETER_DISPLAY_KEY]: "Any day",
            })}
            </div>
            <div>
              ${this.getDropdownHtml({
                label:"Select event city:",
                id: SEARCH_CITY_ID,
                name: "cities",
                data: eventSearchStore.cityList ?? [{name:"Any location"}],
                selected: eventSearchStore.location,
                [DEFAULT_PARAMETER_KEY]:DEFAULT_SEARCH_PARAMETER,
                [DEFAULT_PARAMETER_DISPLAY_KEY]: "Any location",
              })}
            </div>
            ${eventSearchStore.location ?
              `<div>
              ${this.getDropdownHtml({
                label:"Select distance:",
                id: SEARCH_DISTANCE_ID,
                name: "distance",
                data: DISTANCE_OPTIONS,
                selected: eventSearchStore.distance,
                [DEFAULT_PARAMETER_KEY]:"0 miles",
                [DEFAULT_PARAMETER_DISPLAY_KEY]: "0 miles",
              })}</div>` :
               ``}
            
              <div id="searchInputDiv"> 
                <div class = "image-div">  
                  <img src="/assets/house.png">
                </div>
                
                <div> 
                 ${generateButton({
                  text: "Search groups",
                  class: "search-button",
                  component: this,
                  id: SEARCH_BUTTON_ID
                })}
                </div> 
            </div>
          </div>
        </form>
      </div>
  `;

  }

  getDropdownHtml(dropdownConfig: DropdownConfig) {

    return ` 
    <label class="searchDropdownLabel">${dropdownConfig.label} </label>
    <select
      id=${dropdownConfig.id}
      name=${dropdownConfig.name}
      value=${dropdownConfig.data}
    >
    ${dropdownConfig.data?.map(
      (item: any) =>
        `<option key=${item.index} value="${item.name}" ${item.name === dropdownConfig.selected ? "selected" : ""}>
          ${
          item.name === DEFAULT_SEARCH_PARAMETER
            ? dropdownConfig.defaultParameterDisplay
            : getDisplayName(item.name)
        }
        </option>`,
    )}
    </select>`;
  }


}

if (!customElements.get("group-search-component")) {
  customElements.define("group-search-component", GroupSearchComponent);
}
