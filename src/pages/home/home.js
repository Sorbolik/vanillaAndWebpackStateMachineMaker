import { composeTemplate, fetchFromFile } from "../../utils/misc.js";

const HomePageMetaUrl = import.meta.url;

class HomePage extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {

        let html = await fetchFromFile(HomePageMetaUrl, './home.html');
        let css = await fetchFromFile(HomePageMetaUrl, './home.css');
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(composeTemplate(html, css).content.cloneNode(true));
    }
}

window.customElements.define('home-page', HomePage);

export { HomePageMetaUrl }
