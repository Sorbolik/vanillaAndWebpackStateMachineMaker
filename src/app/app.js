import html from "./app.html";
import css from "./app.css";
import { setupShadow } from "../utils/misc";

export class App extends HTMLElement {

    constructor() {
        super();
        setupShadow(this, html, css);
    }

    connectedCallback() {

    }
}
