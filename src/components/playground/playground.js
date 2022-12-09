import html from "./playground.html";
import css from "./playground.css";
import { setupShadow } from "../../utils/misc";
import { v4 as uuidv4 } from 'uuid';
import { StateMachine } from "../../models/stateMachine";

export class Playground extends HTMLElement {

    _playgroundContainer = null;
    _slotReference = null;
    _svgElement = null;
    _stateMachine = new StateMachine();
    _startArrowPoint = null;
    _firstStateTarget = null;
    line = null;

    constructor() {
        super();
        setupShadow(this, html, css);
    }

    connectedCallback() {
        this._playgroundContainer = this.shadowRoot.querySelector('#playground-container');
        this.addEventListener('createstate', (e) => {
            this.createState(e);
        }, true);

        let slot = document.createElement("div");
        slot.id = "slot0";
        slot.className = "slot";
        slot.style.maxHeight = slot.style.height;
        slot.style.maxWidth = slot.style.width;
        this._slotReference = slot;
        this._playgroundContainer.appendChild(this._slotReference);

        this.createGrid();

        this.createStateMachine();
    }

    createGrid() {
        let numberOfPossibleslotesY = Math.floor(window.innerHeight / this._slotReference.offsetHeight - 6);
        let numberOfPossibleslotesX = Math.floor(window.innerWidth / this._slotReference.offsetWidth - 5);

        let repeaterY = `repeat(${numberOfPossibleslotesY}, 1fr)`;
        let repeaterX = `repeat(${numberOfPossibleslotesX}, 1fr)`;
        this._playgroundContainer.style['grid-template-rows'] = repeaterY;
        this._playgroundContainer.style['grid-template-columns'] = repeaterX;

        for (let i = 0; i < numberOfPossibleslotesY * numberOfPossibleslotesX - 1; i++) {
            let nSlotReference = this._slotReference.cloneNode();
            nSlotReference.id = "slot" + (i + 1);
            nSlotReference.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            nSlotReference.addEventListener('drop', (e) => {
                e.preventDefault();
                console.log(this, e);
                let elementId = e.dataTransfer.getData("element_id");
                e.target.appendChild(this._playgroundContainer.querySelector(`#${elementId}`));
            });
            this._playgroundContainer.appendChild(nSlotReference);
        }


    }

    createStateMachine() {
        this.line = this.shadowRoot.querySelector(".line");
        let arrow = this.shadowRoot.querySelector(".arrow");

        this.line.appendChild(arrow);
    }

    createState(e) {
        let state = document.createElement("div");
        state.draggable = true;
        state.id = `state${uuidv4()}`;
        state.className = "state";
        this.addEveryEventToState(state);
        let slotToFill = Array.from(this._playgroundContainer.querySelectorAll(".slot")).find(elem => {
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
            console.log("dblclick fired", e.target);

            if (!this._firstStateTarget) {
                this._firstStateTarget = e.target;
            } else {
                this.adjustLine(this._firstStateTarget, e.target, this.line)
                this._firstStateTarget = null;
            }

        });

        item.addEventListener('click', (e) => {
            console.log(e);
        });
    }

    adjustLine(from, to, line) {

        var fT = from.offsetTop + from.offsetHeight / 2;
        var tT = to.offsetTop + to.offsetHeight / 2;
        var fL = from.offsetLeft + from.offsetWidth / 2;
        var tL = to.offsetLeft + to.offsetWidth / 2;

        console.log("fromTOP: ", fT);
        console.log("toTOP: ", tT);
        console.log("fromLEFT: ", fL);
        console.log("toLEFT: ", tL);

        var CA = Math.abs(tT - fT);
        var CO = Math.abs(tL - fL);
        var H = Math.sqrt(CA * CA + CO * CO);
        var ANG = 180 / Math.PI * Math.acos(CA / H);

        if (tT > fT) {
            var top = (tT - fT) / 2 + fT;
        } else {
            var top = (fT - tT) / 2 + tT;
        }
        if (tL > fL) {
            var left = (tL - fL) / 2 + fL;
        } else {
            var left = (fL - tL) / 2 + tL;
        }

        if ((fT < tT && fL < tL) || (tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)) {
            ANG *= -1;
        }
        top -= H / 2;

        line.style["-webkit-transform"] = 'rotate(' + ANG + 'deg)';
        line.style["-moz-transform"] = 'rotate(' + ANG + 'deg)';
        line.style["-ms-transform"] = 'rotate(' + ANG + 'deg)';
        line.style["-o-transform"] = 'rotate(' + ANG + 'deg)';
        line.style["-transform"] = 'rotate(' + ANG + 'deg)';
        line.style.top = top + 'px';
        line.style.left = left + 'px';
        line.style.height = H + 'px';
    }

}
