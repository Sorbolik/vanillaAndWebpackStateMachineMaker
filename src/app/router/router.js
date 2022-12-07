import { composeTemplate, fetchFromFile } from "../../utils/misc.js";

const AppRouterMetaUrl = import.meta.url;

class AppRouter extends HTMLElement {

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
        })
    }

    async connectedCallback() {
        let html = await fetchFromFile(AppRouterMetaUrl, './router.html');
        let css = await fetchFromFile(AppRouterMetaUrl, './router.css');
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(composeTemplate(html, css).content.cloneNode(true));
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

window.customElements.define('app-router', AppRouter);

export { AppRouterMetaUrl }
