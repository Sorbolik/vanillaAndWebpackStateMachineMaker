
import html from "./customButton.html";
import css from "./customButton.css";

export class CustomButton extends HTMLButtonElement {

    constructor() {
        super();

    }

    connectedCallback() {

        const template = document.createElement("template");
        // applies global styles, local styles and html
        template.innerHTML = `
    <style>${css}</style>${html}
    `;

        template.innerHTML.replace(`content: ''`, `content: ${this.getAttribute("pickIcon")}`)
        this.appendChild(template.content);

        console.log(this.style.getPropertyValue("button::before"));
        this.innerHTML.concat(`<div src="${this.getAttribute("pickIcon")}"></div>`)

    }

    buttonFunction() {
        console.log(this);
    }


}
