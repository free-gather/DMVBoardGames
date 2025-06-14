export class NavbarComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <nav>
        <a href="index.html">Home</a>
        <a href="designers.html">Local designers</a>
        <a href="print_and_play.html">Print and Play</a>
        <a href="/plans.html">Future plans</a>
        <a href="useful_links.html">Useful Links</a>
      </nav>
    `;
  }
}

if (!customElements.get("navbar-component")) {
  customElements.define("navbar-component", NavbarComponent);
}
