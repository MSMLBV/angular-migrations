import { Column } from '../column';
import { Buildable } from '../../contracts/buildable';

export class Builder implements Buildable {
    protected columns: Array<Column> = [];

    constructor(public table: string) {}

    /**
     * Add a column
     */
    protected addColumn(
        action: 'create' | 'drop' | 'add',
        name: string,
        type = '',
        params: string[] = []
    ): Column {
        const column = new Column(action, name, type, params);

        this.columns.push(column);

        return column;
    }

    /**
     * addColumn alias
     */
    public column(name: string, type: string, params: string[] = []): Column {
        return this.addColumn('create', name, type, params);
    }

    /**
     * Format table name
     */
    protected getTableName(): string {
        return '`' + this.table + '`';
    }

    /**
     * Get the SQL for all columns
     */
    protected getColumns(): string[] {
        return this.columns.map(column => column.toSql());
    }

    /**
     * Generate the statement
     */
    protected statement(type = 'create', cases): string {
        return [
            type.toUpperCase(),
            'TABLE',
            // Cases you can apply to check if a table exists or not
            cases.exists || false ? 'IF EXISTS' : '',
            cases['not-exists'] || false ? 'IF NOT EXISTS' : '',
            this.getTableName()
        ]
            .filter(part => part.length > 0)
            .join(' ');
    }

    /**
     * Get a create statement
     */
    protected getCreateStatement(columns: string, cases): string {
        return [this.statement('create', cases), '(', columns, ')'].join(' ');
    }

    /**
     * Generate SQL with certain cases.
     */
    public toSql(cases): string[] {
        return [
            [this.getCreateStatement(this.getColumns().join(', '), cases)].join(
                ' '
            )
        ];
    }
}
