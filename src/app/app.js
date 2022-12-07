import { composeTemplate, fetchFromFile } from "../utils/misc.js";

const AppMetaUrl = import.meta.url;

class App extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        let html = await fetchFromFile(AppMetaUrl, './app.html');
        let css = await fetchFromFile(AppMetaUrl, './app.css');
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(composeTemplate(html, css).content.cloneNode(true));
    }

}

window.customElements.define('web-app', App)
export { AppMetaUrl };
