import { composeTemplate, fetchFromFile } from "../../utils/misc.js";

const ContactsPageMetaUrl = import.meta.url

class ContactsPage extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {

        let html = await fetchFromFile(ContactsPageMetaUrl, './contacts.html');
        let css = await fetchFromFile(ContactsPageMetaUrl, './contacts.css');
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(composeTemplate(html, css).content.cloneNode(true));
    }
}

window.customElements.define('contacts-page', ContactsPage);

export { ContactsPageMetaUrl }
