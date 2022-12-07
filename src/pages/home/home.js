import html from "./home.html";
import css from "./home.css";
import { setupShadow } from "../../utils/misc";
export class HomePage extends HTMLElement {

    constructor() {
        super();
        setupShadow(this, html, css);
    }

    connectedCallback() {

    }
}
