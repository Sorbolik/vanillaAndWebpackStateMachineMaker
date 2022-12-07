import html from "./router.html";
import css from "./router.css";
import { setupShadow } from "../../utils/misc";
export class AppRouter extends HTMLElement {

    oldRef = ``;
    routes = {
        '/': 'home-page',
        '/contacts': 'contacts-page'
    }

    constructor() {
        super();
        this.initRouter();
        window.addEventListener('locationchange', () => {
            this.onRouteChanged();
        });
        setupShadow(this, html, css);

    }

    connectedCallback() {
        this.onRouteChanged();
    }

    initRouter() {
        let pushState = history.pushState;
        let replaceState = history.replaceState;

        history.pushState = function () {
            pushState.apply(history, arguments);
            window.dispatchEvent(new Event('pushstate'));
            window.dispatchEvent(new Event('locationchange'));
        }

        history.replaceState = function () {
            replaceState.apply(history, arguments);
            window.dispatchEvent(new Event('replacestate'));
            window.dispatchEvent(new Event('locationchange'));
        }

        window.addEventListener('popstate', function () {
            window.dispatchEvent(new Event('locationchange'))
        });

    }

    onRouteChanged() {
        this.shadowRoot.getElementById('root').innerHTML = `<${this.routes[window.location.pathname]}/>`
    }

    onNavigate(pathname) {
        window.history.pushState(
            {},
            pathname,
            `${window.location.origin}${pathname}`
        )
    }
}