import { Migration as MigrationContract } from '../contracts/migration';
import { SQLService } from '../contracts/sql.service';

export abstract class Migration implements MigrationContract {
    protected sql: SQLService;
    public abstract name: string;

    constructor(public after: Array<Migration> = []) {
        /** */
    }

    public boot(sql: SQLService) {
        this.sql = sql;
    }

    public abstract up(): Array<Promise<any>>;

    public abstract down(): Array<Promise<any>>;

    public handle(batch, migrated): Promise<any> {
        return new Promise((resolve, reject) => {
            // Check if the migration is already migrated
            if (migrated.indexOf(this.name) > -1) {
                console.debug('Skipping: ' + this.name);

                return resolve('skiped: `' + this.name + '`');
            }
            console.debug('Migrating: ' + this.name);

            // Execute the migration in the `up` method
            Promise.all(this.up()).then(
                response => {
                    this.sql
                        .query(
                            'INSERT INTO migrations (name, batch) VALUES (?, ?)',
                            [this.name, batch]
                        )
                        .then(() => {
                            resolve(response);
                        }, reject);
                },
                error => {
                    console.error(error);

                    throw new Error(
                        'Error: migrating `' +
                            this.name +
                            '` (code: ' +
                            error.code +
                            ', message: ' +
                            error.err.message +
                            ')'
                    );
                }
            );
        });
    }

    /**
     * @deprecated WIP
     */
    public handleDown(batch, migrated): Promise<any> {
        return new Promise(resolve => {
            this.sql
                .query('DELETE FROM migrations WHERE name = ?', [this.name])
                .then(resp => {
                    Promise.all(this.up()).then(
                        response => {
                            Promise.all(
                                this.after.map(migration => {
                                    if (migrated.indexOf(migration.name) < 0) {
                                        return new Promise(resolve =>
                                            resolve('skip')
                                        );
                                    }

                                    migration.boot(this.sql);

                                    return migration.handleDown(
                                        batch,
                                        migrated
                                    );
                                })
                            ).then(
                                responses => {
                                    resolve([response].concat(responses));
                                },
                                err => console.error(err)
                            );
                        },
                        err => console.error(err)
                    );
                });
        });
    }
}
