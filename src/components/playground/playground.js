import html from "./playground.html";
import css from "./playground.css";
import { setupShadow } from "../../utils/misc";
import { v4 as uuidv4 } from 'uuid';

export class Playground extends HTMLElement {

    playgroundContainer = null;
    slotReference = null;

    constructor() {
        super();
        setupShadow(this, html, css);
    }

    connectedCallback() {
        this.playgroundContainer = this.shadowRoot.querySelector('#playground-container');
        this.addEventListener('createstate', (e) => {
            this.createState(e);
        }, true);

        let slot = document.createElement("div");
        slot.id = "slot0";
        slot.className = "slot";
        slot.style.maxHeight = slot.style.height;
        slot.style.maxWidth = slot.style.width;
        this.slotReference = slot;
        this.playgroundContainer.appendChild(this.slotReference);

        this.createGrid();
        this.addDropEventListenerToEverySlot();
    }

    createGrid() {
        let numberOfPossibleslotesY = Math.floor(window.innerHeight / this.slotReference.offsetHeight - 6);
        let numberOfPossibleslotesX = Math.floor(window.innerWidth / this.slotReference.offsetWidth - 5);

        let repeaterY = `repeat(${numberOfPossibleslotesY}, 1fr)`;
        let repeaterX = `repeat(${numberOfPossibleslotesX}, 1fr)`;
        this.playgroundContainer.style['grid-template-rows'] = repeaterY;
        this.playgroundContainer.style['grid-template-columns'] = repeaterX;

        for (let i = 0; i < numberOfPossibleslotesY * numberOfPossibleslotesX - 1; i++) {
            let nslotReference = this.slotReference.cloneNode();
            nslotReference.id = "slot" + (i + 1)
            this.playgroundContainer.appendChild(nslotReference);
        }
    }

    createState(e) {
        let state = document.createElement("div");
        state.draggable = true;
        state.id = `state${uuidv4()}`;
        state.className = "state";
        this.addEveryEventToState(state);
        let slotToFill = Array.from(this.playgroundContainer.querySelectorAll(".slot")).find(elem => {
            return elem.firstChild === null;
        })
        slotToFill.appendChild(state);
    }

    addEveryEventToState(item) {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData("element_id", e.target.id);
            this.style.opacity = '0.4';
        });
        item.addEventListener('dragend', (e) => {
            this.style.opacity = '1';
        });

        item.addEventListener('dblclick', (e) => {
            console.log("dblclick fired", e);
            //open popup for adding state name
        });

        item.addEventListener('click', (e) => {

        });
    }

    addDropEventListenerToEverySlot() {

        let items = this.playgroundContainer.querySelectorAll(".slot");
        items.forEach(item => {
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                console.log(this, e);
                let elementId = e.dataTransfer.getData("element_id");
                e.target.appendChild(this.playgroundContainer.querySelector(`#${elementId}`));
            });
        });
    }
}
