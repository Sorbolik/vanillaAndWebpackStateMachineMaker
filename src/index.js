//add every module (web components) script to the index.html file
import { AppMetaUrl } from "./app/app.js";
import { AppRouterMetaUrl } from "./app/router/router.js";
import { HeaderMetaUrl } from "./components/header/header.js";
import { PlaygroundMetaUrl } from "./components/playground/playground.js";
import { ContactsPageMetaUrl } from "./pages/contacts/contacts.js";
import { HomePageMetaUrl } from "./pages/home/home.js";

const webComponents = [
    AppMetaUrl,
    HeaderMetaUrl,
    AppRouterMetaUrl,
    ContactsPageMetaUrl,
    HomePageMetaUrl,
    PlaygroundMetaUrl
]

webComponents.forEach(componentUrl => {

    let script = document.createElement('script');
    script.src = `${componentUrl}`;
    script.type = 'module';
    document.querySelector('meta').appendChild(script);
})



