import html from "./home.html?raw";
import css from "./home.css?raw";
import { setupShadow } from "../../utils/misc";
export class HomePage extends HTMLElement {

    constructor() {
        super();
        setupShadow(this, html, css);
    }

    connectedCallback() {

    }
}
