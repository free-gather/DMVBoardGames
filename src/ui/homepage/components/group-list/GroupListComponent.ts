import type { GroupSearchResult } from "../../data/types/group/GroupSearchResult.ts";
import {AbstractPageComponent, BaseTemplateDynamicComponent} from "@bponnaluri/places-js";
import {generateButton} from "../../../../shared/components/ButtonGenerator.ts";
import {getDisplayName} from "../../../../shared/DisplayNameConversion.ts";

import {GROUP_SEARCH_THUNK} from "../../data/search/GroupSearchThunk.ts";
import {DEFAULT_SEARCH_PARAMETER} from "../group-search/Constants.ts";
import {searchResultReducer} from "../../data/store/SearchResultReducer.ts";
import {GroupPageComponent} from "../../../groups/viewGroup/components/GroupPageComponent.ts";

const loadConfig = [{
      componentReducer: searchResultReducer,
      dataThunk: GROUP_SEARCH_THUNK,
      /*When updating component state, values for top level keys that do not have corresponding key value pairs
       in the reducer remain. As a result, a key must be specified to ensure that component state is updated
       to only contain groups from the search results.
       */
      fieldName: "searchResults",
      params: {
        city: DEFAULT_SEARCH_PARAMETER,
        day: DEFAULT_SEARCH_PARAMETER
      }
    }]


const template = `

  <link rel="preload" as="style" href="/styles/sharedComponentStyles.css" onload="this.rel='stylesheet'"/>
  <style>

    .event-group:not(:first-child){
      border-top:  5px solid;
      border-image-source: url(assets/Section_Border_Tiny.png);
      border-image-slice: 5 5;
      border-image-repeat: round;
    }
    
    @media not screen and (width < 32em) {
    
      .event-group-location {
        display: inline-block;
        margin-left: 2rem;
      }
    }  
    @media screen and (width < 32em) {
      a {
        margin-top: 1rem;
      }
  
      .event-group-location {
        display: none; 
      }
      .ui-section .event-group:not(:first-child) {
        margin-top: 0.5rem;
      }
    }
    
    .event-group {
      display: flex;
      align-items: center;
      height: 5rem;
    }
    
    .image-div img {
      padding-top:10px
    }
    
    .image-div {
      padding-right: 0.5rem;
      max-width:3rem;
    }
    .image-div, .button-div {
      display: flex;
    }
  </style>
`;
export class GroupListComponent extends BaseTemplateDynamicComponent {
  constructor() {
    super(loadConfig);
  }

  private getItemHtml(groupId: string, group: GroupSearchResult) {
    let groupHtml: string;
    groupHtml = `
      <div id=${groupId} class=${"event-group"}>
        
        <div class = "image-div">  
          <img src="/assets/house.png">
        </div>
         
        <div class = "button-div">
        ${generateButton({
          id: "group-button-"+groupId,
          text: group.title,
          type: "submit"
        })}
         </div>
   
        <p class="event-group-location">${group.locations.map(name=>getDisplayName(name))?.join(", ") ?? ""}</p>              
        
      </div>
    `;
    return groupHtml;
  }
  
  override getTemplateStyle(): string {
    return template;
  }

  handleClickEvents(event:any){
    const groupName = event.originalTarget.textContent;
    //@ts-ignore
    AbstractPageComponent.updateRoute(GroupPageComponent,{name:groupName})
  }

  render(data: any): string {
    let html = `<div class="ui-section">`;
    const groupHtml = Object.keys(data.searchResults).reduce((result:any, groupId:any)=>{
      return result+this.getItemHtml(groupId, data.searchResults[groupId])
    },'')

    if(!groupHtml)  {
      html += `
      <p>No groups found.</p>
    `;
    }

    else {
      html+=groupHtml;
    }
    return html + `</div>`;
  }
}

if (!customElements.get("group-list-component")) {
  customElements.define("group-list-component", GroupListComponent);
}
