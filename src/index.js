import { App } from "./app/app";
import { AppRouter } from "./app/router/router";
import { ControlBar } from "./components/controlBar/controlBar";
import { CustomButton } from "./components/customButton/customButton";
import { Header } from "./components/header/header";
import { Playground } from "./components/playground/playground";
import { ContactsPage } from "./pages/contacts/contacts";
import { HomePage } from "./pages/home/home";



// Define all custom elements (pages)
customElements.define('web-app', App);
customElements.define('app-router', AppRouter);
customElements.define("home-page", HomePage);
customElements.define('contacts-page', ContactsPage);

//components
customElements.define('app-header', Header);
customElements.define('play-ground', Playground);
customElements.define('control-bar', ControlBar);
customElements.define('custom-playground-button', CustomButton, { extends: "button" });