import { Builder } from './builder/builder';
import { AlterBuilder } from './builder/alter-builder';
import { DropBuilder } from './builder/drop-builder';
import { Buildable } from '../contracts/buildable';
import { SQLService } from '../contracts/sql.service';

export type column = {
    name: string,
    type: string,
    params: string
};

export type schemaCase = {
    type: 'exists' | 'not-exists' | 'column-exists',
    column?: string | string[]
};

export class Schema {
    public cases = [];

    /**
     * Build a create schema with blueprint
     */
    public static create(table: string, builder: (builder: Builder) => void): Schema {
        return new Schema(Schema.build(builder, new Builder(table)));
    }

    /**
     * Build an alter schema with blueprint
     */
    public static alter(table: string, builder: (builder: AlterBuilder) => void): Schema {
        return new Schema(Schema.build(builder, new AlterBuilder(table)));
    }

    /**
     * Build a drop schema with blueprint
     */
    public static drop(table: string): Schema {
        return new Schema(new DropBuilder(table));
    }

    /**
     * Build a blueprint with an callback
     */
    protected static build(builder: (b: Buildable) => void, buildable: Buildable): Buildable {
        builder(buildable);

        return buildable;
    }

    constructor(public builder: Buildable) {}

    /**
     * Add an exists case
     */
    public exists(exists = true): Schema {
        this.cases.push({
            type: exists ? 'exists' : 'not-exists'
        });
        return this;
    }

    /**
     * Add a column exists case
     * @deprecated
     */
    public columnExists(column: string): Schema {
        this.cases.push({
            type: 'column-exists',
            column: column
        });
        return this;
    }

    /**
     * Add multiple column exist cases
     * @deprecated
     */
    public columnsExist(columns: string[]): Schema {
        this.cases.push({
            type: 'column-exists',
            column: columns
        });
        return this;
    }

    /**
     * Format cases
     */
    protected sterilizeCases(cases: schemaCase[]) {
        return cases.reduce((sterilized, schemaCase) => {
            return Object.assign(sterilized, {
                [schemaCase.type]: true
            });
        }, {});
    }

    protected canExecute(sql: SQLService, cases: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (cases['column-exists'] || false) {
                // Filter columns
                const columns = this.cases.filter(({type}) => type === 'column-exists').reduce((columns, {column}) => {
                    return columns.concat(column instanceof Array ? column : [column]);
                }, []);

                // Get the current table columns
                sql.query(
                    `
                        select
                            *
                        from sqlite_master
                        where tbl_name = ?
                            and type = 'table'
                        limit 1
                    `,
                    [this.builder.table]
                ).then(results => {
                    if (results.length < 1) {
                        // Table does not exist
                        return resolve(false);
                    }
                    const table = results[0];

                    // Remove everything except the columns from the TTD
                    const sql = table.sql.substring(
                        table.sql.indexOf('('),
                        table.sql.lastIndexOf(')')
                    );

                    // Check if any of the defined columns exist
                    resolve(columns.filter(column => {
                        return sql.indexOf(column) > -1;
                    }).length < 1);
                }, reject);
            }
            resolve(true);
        });
    }

    /**
     * Execute the schema using a QueryBuilder
     */
    public execute(sqlService: SQLService, bindings: any[] = []): Promise<any> {
        const cases = this.sterilizeCases(this.cases);

        return new Promise<any>((resolve, reject) => {
            this.canExecute(
                sqlService,
                cases
            ).then(should => {
                // Check if the schema should execute
                if (should === true) {
                    // Execute the blueprint with the defined cases
                    return Promise.all(
                        this.builder.toSql(cases).map(sql => {
                            return sqlService.query(sql, bindings);
                        })
                    ).then(resolve, reject);
                }
                resolve(should);
            }, reject);
        });
    }
}
