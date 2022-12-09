export class StateMachine {
    name = '';
    initialState = '';
    states = [];
    endStates = [];
    actions = [];
    isUnitary = false;

    constructor(name,
        initialState,
        states,
        endStates,
        actions,
        isUnitary) {
        this.name = name;
        this.initialState = initialState;
        this.states = states;
        this.endStates = endStates;
        this.actions = actions;
        this.isUnitary = isUnitary;
    }
} 
