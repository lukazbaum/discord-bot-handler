export class SelectMenu {
    customId;
    disabled;
    execute;
    constructor({ customId, disabled = false, execute }) {
        this.customId = customId;
        this.disabled = disabled;
        this.execute = execute;
    }
}
