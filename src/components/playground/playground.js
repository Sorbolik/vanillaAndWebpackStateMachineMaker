import { composeTemplate, fetchFromFile } from "../../utils/misc.js";

const PlaygroundMetaUrl = import.meta.url

class Playground extends HTMLElement {

    playgroundContainer = null;
    box = null;

    constructor() {
        super();
    }

    async connectedCallback() {

        let html = await fetchFromFile(PlaygroundMetaUrl, './playground.html');
        let css = await fetchFromFile(PlaygroundMetaUrl, './playground.css');
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(composeTemplate(html, css).content.cloneNode(true));
        this.playgroundContainer = this.shadowRoot.querySelector('#playground-container');
        this.box = this.shadowRoot.querySelector('.box');
        this.createGrid();
        this.addDragAndDropEventListener();

    }

    createGrid() {
        // this.playgroundContainer.style['grid-template-rows'] = "repeat(14, 1fr)";
        console.log(window.innerHeight / this.box.offsetHeight);
        let repeaterY = `repeat(${Math.floor(window.innerHeight / this.box.offsetHeight)}, 1fr)`;
        let repeaterX = `repeat(${Math.floor(window.innerWidth / this.box.offsetWidth)}, 1fr)`;
        this.playgroundContainer.style['grid-template-rows'] = repeaterY;
        this.playgroundContainer.style['grid-template-columns'] = repeaterX;
        // `
        // <style>
        //     grid-template-rows: repeat(14, 1fr);
        // <style/>
        // `
    }

    addDragAndDropEventListener() {

        function handleDragStart(e) {
            this.style.opacity = '0.4';
        }

        function handleDragEnd(e) {
            this.style.opacity = '1';
        }

        let items = this.shadowRoot.querySelectorAll('.box');
        items.forEach(item => {
            item.addEventListener('dragstart', handleDragStart, false);
            item.addEventListener('dragend', handleDragEnd, false);
        });

    }
}

window.customElements.define('play-ground', Playground);

export { PlaygroundMetaUrl }
