export class Event {
    name;
    once;
    disabled;
    execute;
    constructor({ name, once = false, disabled = false, execute }) {
        this.name = name;
        this.once = once;
        this.disabled = disabled;
        this.execute = execute;
    }
}
