import { Builder } from './builder';
import { Column } from '../column';

export class AlterBuilder extends Builder {
    /**
     * addColumn alias
     */
    public column(name: string, type: string, params: string[] = []): Column {
        return this.addColumn('add', name, type, params);
    }

    /**
     * Drop a certain column
     */
    public dropColumn(name: string): Column {
        return this.addColumn('drop', name);
    }

    /**
     * Generate alter statement
     */
    protected getAlterStatement(column: string, cases): string {
        return [
            this.statement('alter', cases), column
        ].join(' ');
    }

    /**
     * Generate SQL with certain cases.
     */
    public toSql(cases): string[] {
        return this.getColumns().map(column => {
            return this.getAlterStatement(column, cases);
        });
    }
}
