import {
  BaseTemplateDynamicComponent,
} from "@bponnaluri/places-js";
import {LOGIN_THUNK} from "../../ui/auth/data/LoginThunk.ts";
import {LOGOUT_THUNK} from "../../ui/auth/data/LogoutThunk.ts";

const loadConfig = [{
      dataThunk: LOGIN_THUNK
    }]


const template = `
   
  <style>
  
  a {
    border-color: var(--clr-darker-blue);
    border-width: 1px;
    color: white;
    font-size: 1.5rem;
    font-weight: 400;
    margin-top: 0.5rem;
    padding: 0.5rem;
    text-decoration: none;
  }
  
  span {
    font-weight: 400;
  }
  
  a:hover {
    background-color: var(--clr-darker-blue);
  }
  
  div {
    padding-top:0.25rem;
    font-size: 1.5rem;
    color:var(--clr-darker-blue)
  }
  
  button {
    font-size: 1.5rem;
  }
  
  button:active {
    background-color: var(--clr-darker-blue) !important;
  }

  </style>
`

const SIGN_OUT_LINK_ID = "signout-link"
export class LoginStatusComponent extends BaseTemplateDynamicComponent {

  constructor() {
    super(loadConfig);
  }

  override getTemplateStyle(): string {
    return template;
  }

  override attachEventHandlersToDom(shadowRoot?: any){
    shadowRoot?.getElementById(SIGN_OUT_LINK_ID)?.addEventListener("click",()=>{
      LOGOUT_THUNK.getData({}, LOGIN_THUNK)
    });
  }

  override render(data:any){
    if(data.loggedIn){
      return `
        <span>Welcome ${data?.username}</span>
        <a id="${SIGN_OUT_LINK_ID}">Sign out</a>
      `
    }
    return `<a href="/login.html">Sign in </a>`;
  }
}

if (!customElements.get("login-status-component")) {
  customElements.define("login-status-component", LoginStatusComponent);
}