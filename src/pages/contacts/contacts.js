import html from "./contacts.html";
import css from "./contacts.css";
import { setupShadow } from "../../utils/misc";
export class ContactsPage extends HTMLElement {

    constructor() {
        super();
        setupShadow(this, html, css);
    }

    connectedCallback() {

    }
}
