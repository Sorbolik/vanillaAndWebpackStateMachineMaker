import html from "./app.html?raw";
import css from "./app.css?raw";
import { setupShadow } from "../utils/misc";

export class App extends HTMLElement {

    constructor() {
        super();
        setupShadow(this, html, css);
    }

    connectedCallback() {

    }
}
