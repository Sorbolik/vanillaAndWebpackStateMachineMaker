export class Action {

    actionName = "";
    fromState = "";
    toState = "";
    cost = 0;

    constructor(actionName,
        fromState,
        toState,
        cost) {
        this.actionName = actionName;
        this.fromState = fromState;
        this.toState = toState;
        this.cost = cost;
    }
}