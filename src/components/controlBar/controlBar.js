import html from "./controlBar.html";
import css from "./controlBar.css";
import { setupShadow } from "../../utils/misc";
export class ControlBar extends HTMLElement {

    constructor() {
        super();
        setupShadow(this, html, css);
    }

    connectedCallback() {

    }

    funcs() {

    }
}
