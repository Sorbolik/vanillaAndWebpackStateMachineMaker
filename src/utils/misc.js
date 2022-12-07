
/** Create shadow and merge html + css */
export const setupShadow = (element, html, css) => {
    const shadow = element.attachShadow({ mode: "open" });
    const template = document.createElement("template");
    // applies global styles, local styles and html
    template.innerHTML = `
    <style>${css}</style>${attachCallbacks(html, element)}
    `;
    const templateContent = template.content;
    shadow.appendChild(templateContent.cloneNode(true));
};

/** Saving global component reference to window and replacing this. in html with reference */
const attachCallbacks = (html, element) => {
    const lastId = Window.lastComponentId ? Window.lastComponentId : 0;
    const componentId = lastId + 1;
    Window.lastComponentId = componentId;

    const componentName = "component" + componentId;
    console.log(componentName);
    Window[componentName] = element;
    return html.replaceAll("this.", "Window." + componentName + ".");
};
