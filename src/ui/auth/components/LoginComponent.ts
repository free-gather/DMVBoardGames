import {getLoginComponentStoreFromLoginResponse, LOGIN_THUNK,} from "../data/LoginThunk.ts";

import {LOGOUT_THUNK} from "../data/LogoutThunk.ts";
import {LOGIN_FORM_ID, PASSWORD_INPUT, USERNAME_INPUT,} from "../Constants.js";

import type {LoginComponentStore} from "../types/LoginComponentStore.ts";
import {
  COMPONENT_LABEL_KEY,
  IS_LOGGED_IN_KEY,
  SUCCESS_MESSAGE_KEY
} from "../../../shared/Constants.ts";
import {
  BaseTemplateDynamicComponent,
  InternalApiAction,
} from "@bponnaluri/places-js";
import {generateButton} from "../../../shared/components/ButtonGenerator.ts";
import {generateErrorMessage} from "@bponnaluri/places-js";
import {API_ROOT} from "../../../shared/Params.ts";


const template = `
  <link rel="stylesheet" type="text/css"  href="/styles/sharedComponentStyles.css"/>

  <style>
    #login-component-container {
      padding-top: 0.25rem;
    }
    
    #component-buttons {
      padding-top:0.5rem;
    }
    
    .ui-input {
      display: inline-block;
    }
    
    @media screen and (width < 32em) {
      #login-component-container {
        text-align: center;
      }
      .login-element {
        font-size:1rem;
      }
    }

  </style>

`;

const LOGIN_BUTTON_ID = "login-button";
const REGISTER_BUTTON_ID = "register-button";
const LOGOUT_BUTTON_ID = "logout-button";

export class LoginComponent extends BaseTemplateDynamicComponent {

  hasRendered: boolean;

  constructor() {
    super([{
          componentReducer: getLoginComponentStoreFromLoginResponse,
          dataThunk: LOGIN_THUNK,
        }]
      );
    this.hasRendered = false;
  }

  retrieveAndValidateFormInputs() {

    const username = this.getFormValue(USERNAME_INPUT);
    const password = this.getFormValue(PASSWORD_INPUT);
    if (!username || !password) {
      return {
        errorMessage: "Enter a valid username and password"
      }
    }
    return {
      username: username,
      password: password
    };
  }

  connectedCallback(){

    const self = this;
    this.addEventListener("click",(event:any)=>{

      event.preventDefault();

      try {
        const targetId = event.originalTarget?.id;
        if (targetId === LOGIN_BUTTON_ID){

          const formInputs = self.retrieveAndValidateFormInputs()
          if(formInputs.errorMessage){
            self.updateData(formInputs)
          } else {
            LOGIN_THUNK.getData({
              username: self.getFormValue(USERNAME_INPUT),
              password: self.getFormValue(PASSWORD_INPUT)
            })
          }
        }

        if (targetId === REGISTER_BUTTON_ID) {
          const formInputs = self.retrieveAndValidateFormInputs()
          if(formInputs.errorMessage){
            self.updateData(formInputs)
          } else {

            InternalApiAction.getResponseData({
              body: JSON.stringify(formInputs),
              method: "POST",
              url: API_ROOT + `/users/register`,
            }).then((response:any)=>{

              console.log(response)
              if(response.errorMessage){
                self.updateData({
                  "errorMessage":response.errorMessage
                })
              } else {
                self.updateData({
                  [SUCCESS_MESSAGE_KEY]: "Successfully registered user"
                })
              }
            })
          }
        }

        if (targetId === LOGOUT_BUTTON_ID) {
          LOGOUT_THUNK.getData({}, LOGIN_THUNK)
        }
      }catch(e:any){
        if(e.message !== `Permission denied to access property "id"`){
          throw e;
        }
      }

    })
  }
  override getTemplateStyle(): string {
    return template;
  }

  render(data: LoginComponentStore) {
    return data[IS_LOGGED_IN_KEY] ?
        '' :
        this.generateLogin(data)
  }
  generateLogin(data: LoginComponentStore) {

    const html = `
     <div class="ui-section" id="login-component-container">
      <form id=${LOGIN_FORM_ID}>
        <div class="ui-input">
          ${this.addShortInput({
            id: USERNAME_INPUT,
            [COMPONENT_LABEL_KEY]: "Email",
            inputType: "text",
            value: ""
          })}
        </div>
        
        <div class="ui-input">
          ${this.addShortInput({
            id: PASSWORD_INPUT,
            [COMPONENT_LABEL_KEY]: "Password",
            inputType: "text",
            value: ""
          })}
        </div>
        
        <br>

        <div id="component-buttons">
        
        ${generateButton({
          class: "login-element",
          id: LOGIN_BUTTON_ID,
          text: "Login",
          type: "submit",
        })}
        
        ${generateButton({
          class: "login-element",
          id: LOGIN_BUTTON_ID,
          type: "submit",
          text: "Register",
        })}

                    
          </div>
          ${this.hasRendered ? generateErrorMessage(data.errorMessage) : ''}
        </form>

    </div>
    `;
    this.hasRendered = true;
    return html;
  }
}

if (!customElements.get("login-component")) {
  customElements.define("login-component", LoginComponent);
}
