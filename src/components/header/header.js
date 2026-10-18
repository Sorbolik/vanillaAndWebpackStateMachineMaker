import html from "./header.html?raw";
import css from "./header.css?raw";
import { setupShadow } from "../../utils/misc";
export class Header extends HTMLElement {

    constructor() {
        super();
        setupShadow(this, html, css);
    }

    connectedCallback() {
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
