import { composeTemplate, fetchFromFile } from "../../utils/misc.js";

const HeaderMetaUrl = import.meta.url

class Header extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {

        let html = await fetchFromFile(HeaderMetaUrl, './header.html');
        let css = await fetchFromFile(HeaderMetaUrl, './header.css');
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(composeTemplate(html, css).content.cloneNode(true));

        this.shadowRoot.querySelectorAll('a').forEach(child => {
            child.addEventListener('click', () => {
                this.onNavigate(child.getAttribute('redirectTo'));
            })
        });
    }

    onNavigate(pathname) {
        window.history.pushState(
            {},
            pathname,
            `${window.location.origin}${pathname}`
        )
    }
}

window.customElements.define('app-header', Header);

export { HeaderMetaUrl }
