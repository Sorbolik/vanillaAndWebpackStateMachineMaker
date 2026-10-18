import html from "./contacts.html?raw";
import css from "./contacts.css?raw";
import { setupShadow } from "../../utils/misc";
export class ContactsPage extends HTMLElement {

    constructor() {
        super();
        setupShadow(this, html, css);
    }

    connectedCallback() {

    }
}
