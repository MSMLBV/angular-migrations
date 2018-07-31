export class Column {
    constructor(
        protected action: 'create' | 'drop' | 'add',
        protected name: string,
        protected type = '',
        protected params: string[] = []
    ) {}

    /**
     * Compile a create column statement
     */
    protected compileCreate(): string {
        return [this.name, this.type.toUpperCase()].concat(this.params).join(' ');
    }

    /**
     * Compile an add column statement
     */
    protected compileAdd(): string {
        return ['ADD', 'COLUMN', this.name, this.type.toUpperCase()].concat(this.params).join(' ');
    }

    /**
     * Compile a drop column statement
     */
    protected compileDrop(): string {
        return ['DROP', 'COLUMN', this.name].concat(this.params).join(' ');
    }

    public toSql(): string {
        return this['compile' + this.action.charAt(0).toUpperCase() + this.action.slice(1)]();
    }
}
