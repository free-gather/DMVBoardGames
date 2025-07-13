import type { DisplayItem } from "../../ui/homepage/data/types/DisplayItem.ts";

import {
  createComponentStore,
  getComponentStore,
  updateComponentStore,
} from "../state/data/ComponentStore.ts";
import {
  hasRequestStore,
  initRequestStore,
  initRequestStoresOnLoad,
  updateRequestStoreAndClearCache,
} from "../state/data/RequestStore.ts";
import { EventHandlerAction } from "../state/update/event/EventHandlerAction.ts";
import { BaseDispatcher } from "../state/update/BaseDispatcher.ts";
import { EventThunk } from "../state/update/event/EventThunk.ts";
import type { EventHandlerThunkConfig } from "../state/update/event/types/EventHandlerThunkConfig.ts";
import {
  type ComponentLoadConfig,
  type ThunkDispatcherConfig,
  validComponentLoadConfigFields,
} from "./types/ComponentLoadConfig.ts";
import type { BaseThunk } from "../state/update/BaseThunk.ts";
import {
  getGlobalStateValue,
  subscribeComponentToGlobalField,
} from "../state/data/GlobalStore.ts";
import type { EventValidationResult } from "../state/update/event/types/EventValidationResult.ts";
import type {FormItemConfig} from "./types/FormItemConfig.ts";
import  {FormSelector} from "../FormSelector.ts";

type EventConfig = {
  eventType: string;
  eventFunction: (e: Event) => any;
};

export abstract class BaseDynamicComponent extends HTMLElement {
  componentStoreName: string;
  eventHandlers: Record<string, EventConfig>;
  eventTagIdCount = 0;

  requestStoreName?: string;
  requestStoreReducer?: BaseThunk;

  instanceId: number;

  dependenciesLoaded: boolean = true;
  componentLoadConfig: ComponentLoadConfig | undefined = undefined;

  formSelector: FormSelector
  static instanceCount = 1;

  constructor(componentStoreName: string, loadConfig?: ComponentLoadConfig) {
    super();

    this.instanceId = BaseDynamicComponent.instanceCount;
    BaseDynamicComponent.instanceCount++;
    this.eventHandlers = {};
    this.componentStoreName = `${componentStoreName}-${BaseDynamicComponent.instanceCount}`;

    this.formSelector = new FormSelector();
    createComponentStore(this.componentStoreName, this);

    if (loadConfig) {
      const self = this;

      self.requestStoreName = loadConfig.onLoadStoreConfig?.storeName;
      self.requestStoreReducer = loadConfig.onLoadStoreConfig?.dataSource;

      Object.keys(loadConfig).forEach((configField: any) => {
        if (!validComponentLoadConfigFields.includes(configField)) {
          throw new Error(
            `Invalid component load config field ${configField} for ${self.componentStoreName}. Valid fields are
            ${validComponentLoadConfigFields}`,
          );
        }
      });

      const globalStateLoadConfig = loadConfig.globalStateLoadConfig;

      if (globalStateLoadConfig?.globalFieldSubscriptions) {
        globalStateLoadConfig.globalFieldSubscriptions.forEach(function (
          fieldName: string,
        ) {
          subscribeComponentToGlobalField(self, fieldName);
          self.componentLoadConfig = loadConfig;

        });
      } else {
        initRequestStoresOnLoad(loadConfig);
      }

      // TODO: Handle case where there are multiple instances of a component that each need different state
      if (loadConfig.thunkReducers) {
        const component = this;

        loadConfig.thunkReducers.forEach(function (
          config: ThunkDispatcherConfig,
        ) {
          if (!config.thunk) {
            throw new Error(
              `Missing thunk field in ${self.componentStoreName} reducer configuration`,
            );
          }
          config.thunk.subscribeComponent(
            component.componentStoreName,
            config.componentStoreReducer,
            config.reducerField,
          );
        });
      }
    }
  }

  updateStore(data: any) {
    this.eventHandlers = {};
    this.eventTagIdCount = 0;

    this.generateAndSaveHTML(data);
    this.attachEventHandlersToDom();
  }

  attachEventHandlersToDom() {
    const eventHandlers = this.eventHandlers;
    const elementIdTag = this.getElementIdTag();

    const addEventHandler = function (item: Element) {
      const id = item.getAttribute(elementIdTag) ?? "";
      const eventConfig = eventHandlers[id];
      item.addEventListener(eventConfig.eventType, eventConfig.eventFunction);
    };

    if (this.shadowRoot) {

      this.formSelector.setShadowRoot(this.shadowRoot);
      this.shadowRoot?.querySelectorAll(`[${elementIdTag}]`).forEach(function (
        item: Element,
      ) {
        addEventHandler(item);
      });
    } else {
      document.querySelectorAll(`[${elementIdTag}]`).forEach(function (
        item: Element,
      ) {
        addEventHandler(item);
      });
    }
  }

  generateAndSaveHTML(data: any) {
    if (!this.dependenciesLoaded) {
      this.innerHTML = this.getLoadingIndicator();
    } else {
      this.formSelector.clearFormSelectors();
      this.innerHTML = this.render(data);
    }
  }

  getLoadingIndicator(){
    return `<h1>Loading</h1>`
  }
  getElementIdTag() {
    return `data-${this.componentStoreName}-element-id`;
  }

  generateButtonsForEditPermission(buttonConfig:Record<string, EventHandlerThunkConfig>):string{
    const userCanEditPermission = getComponentStore(this.componentStoreName)?.permissions?.userCanEdit
    if(userCanEditPermission === undefined){
      throw new Error(`permissions.userCanEdit state not defined for component state ${this.componentStoreName}`);
    }
    if(!userCanEditPermission) {
      return '';
    }

    let html = ''
    var self = this;
    Object.keys(buttonConfig).forEach(function(buttonText){
      html+= `<button ${self.createClickEvent(buttonConfig[buttonText])}> ${buttonText}</button>`;
    });
    return html;
  }

  generateLinksForEditPermission(linkConfig:Record<string, string>):string{
    const userCanEditPermission = getComponentStore(this.componentStoreName)?.permissions?.userCanEdit
    if(userCanEditPermission === undefined){
      throw new Error(`permissions.userCanEdit state not defined for component state ${this.componentStoreName}`);
    }
    if(!userCanEditPermission) {
      return '';
    }

    let html = ''
    Object.keys(linkConfig).forEach(function(linkText){
      html+= `<a href="${window.location.origin}/${linkConfig[linkText]}">${linkText}</a>`;
    });
    return html;
  }

  generateErrorMessage(message: string | string[] | undefined){
    if(Array.isArray(message)){
      let html = ''
      message.forEach((item)=>{
        html+=`<p class="api-error-message">${item.trim()}</p>`

      })
      return html;
    }
    return `
        <p class="api-error-message">${message? message.trim() : ""}</p>
        `
  }

  generateInputFormItem(formConfig:FormItemConfig){

    let formValue = formConfig.value;
    if(!formValue && this.formSelector.hasValue(formConfig.id)){
      formValue = this.formSelector.getValue(formConfig.id);
    }

    this.formSelector.addFormSelector(formConfig.id);
    return `
      <label for=${formConfig.id}>${formConfig.componentLabel}</label>
      ${formConfig.lineBreakAfterLabel !== false? `<br>` : ''}
      <input
        ${formConfig.className ? `class="${formConfig.className}"` : ``}
        id=${formConfig.id}
        name=${formConfig.id}
        type=${formConfig.inputType}
        value="${formValue}"
        />
        <br>
    `
  }

  generateTextInputFormItem(formConfig:FormItemConfig){
    let formValue = formConfig.value;
    if(!formValue && this.formSelector.hasValue(formConfig.id)){
      formValue = this.formSelector.getValue(formConfig.id);
    }
    this.formSelector.addFormSelector(formConfig.id);

    return `
      <label for=${formConfig.id}>${formConfig.componentLabel}</label>
      ${formConfig.lineBreakAfterLabel !== false? `<br>` : ''}
      <textarea
        ${formConfig.className ? `class="${formConfig.className}"` : ``}
        id=${formConfig.id}
        name=${formConfig.id}
        type=${formConfig.inputType}
        /> ${formValue}
      </textarea>
      <br>
    `
  }

  saveEventHandler(
    eventFunction: (e: Event) => any,
    eventType: string,
    targetId?: string,
  ): string {
    let id = `${this.getElementIdTag()}=${this.eventTagIdCount}`;

    this.eventHandlers[this.eventTagIdCount] = {
      eventType: eventType,
      eventFunction: eventFunction,
    };
    this.eventTagIdCount++;

    if (targetId) {
      id += ` id=${targetId}`;
    }
    return id;
  }


  createOnChangeEvent(eventConfig: any) {
    const eventHandler = BaseDynamicComponent.createHandler(
      eventConfig,
      this.formSelector,
      this?.componentStoreName,
    );
    return this.saveEventHandler(eventHandler, "change");
  }

  createSubmitEvent(eventConfig: any) {
    let eventHandler;
    eventHandler = BaseDynamicComponent.createHandler(
      eventConfig,
      this.formSelector,
      this?.componentStoreName,
    );
    return this.saveEventHandler(eventHandler, "submit");
  }

  createClickEvent(eventConfig: any, id?: string) {
    let eventHandler;
    eventHandler = BaseDynamicComponent.createHandler(
      eventConfig,
      this.formSelector,
      this?.componentStoreName,
    );
    return this.saveEventHandler(eventHandler, "click", id);
  }

  static createHandler(
    eventConfig: EventHandlerThunkConfig,
    formSelector: FormSelector,
    storeName?: string,
  ) {
    const storeToUpdate =
      eventConfig?.requestStoreToUpdate &&
      eventConfig.requestStoreToUpdate.length > 0
        ? eventConfig.requestStoreToUpdate
        : storeName;

    if (!storeToUpdate) {
      throw new Error("Event handler must be associated with a valid state");
    }

    const dispatchers: BaseDispatcher[] = [];

    let componentStoreUpdate: any;
    if (eventConfig.componentReducer && storeName) {
      componentStoreUpdate = new BaseDispatcher(
        storeName,
        eventConfig.componentReducer,
      );
      dispatchers.push(componentStoreUpdate);
    }

    const handler = function (e: Event) {

      e.preventDefault();

      const request: EventHandlerAction = new EventHandlerAction(
        eventConfig.eventHandler,
        storeName,
        formSelector
      );

      const storeUpdate = new BaseDispatcher(storeToUpdate, (a: any): any => {
        return a;
      });
      dispatchers.push(storeUpdate);
      const eventUpdater: EventThunk = new EventThunk(request, dispatchers);

      if (eventConfig.validator) {
        const eventConfigValidator = eventConfig.validator;
        const validator = function (): EventValidationResult {
          const componentData = getComponentStore(storeName ?? "");
          return eventConfigValidator(formSelector, componentData);
        };

        eventUpdater.processEvent(e, validator).then((result: any) => {
          if (result?.errorMessage) {
            componentStoreUpdate.updateStore(result);
          }
        });
      } else {
        eventUpdater.processEvent(e);
      }
    };
    return handler;
  }

  updateFromGlobalState() {

    const componentData = getComponentStore(this.componentStoreName);

    const globalStateLoadConfig =
      this.componentLoadConfig?.globalStateLoadConfig;
    if (!globalStateLoadConfig) {
      throw new Error(`Component global state config is not defined for component ${this.componentStoreName}`);
    }

    //Component is still waiting for state.
    this.componentLoadConfig?.globalStateLoadConfig?.globalFieldSubscriptions.forEach(function(fieldName){
      if (
        globalStateLoadConfig.globalFieldSubscriptions &&
        getGlobalStateValue(fieldName) ===
        undefined
      ) {
        return;
      }
    })

    //The component should make an API request based on the data received before rerendering.
    if (this.requestStoreName) {
      if (this.componentLoadConfig && !hasRequestStore(this.requestStoreName)) {
        initRequestStore(this.componentLoadConfig);
      } else {
        updateRequestStoreAndClearCache(this.requestStoreName, {
          name: componentData.name,
        });
      }
      this.dependenciesLoaded = true;
    } else if (globalStateLoadConfig?.defaultGlobalStateReducer) {
      this.dependenciesLoaded = true;
      /*TODO: Handle case where the component is subscribed to global state created by multiple components to prevent
      extra rerenders.
       */
      let dataToUpdate: Record<string, string> = {};

      globalStateLoadConfig?.globalFieldSubscriptions?.forEach(
        function (fieldName) {
          const fieldValue = getGlobalStateValue(fieldName);
          dataToUpdate[fieldName] = fieldValue;
        },
      );
      updateComponentStore(
        this.componentStoreName,
        globalStateLoadConfig.defaultGlobalStateReducer,
        dataToUpdate,
      );
    } else {
      console.error(
        `A default global state reducer or API request store should be defined to subscribe to global state for component ${this.componentStoreName}`,
      );
    }
  }

  abstract render(data: Record<any, DisplayItem> | any): string;
}
