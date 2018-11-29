import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { Inject, Injectable, Optional } from '@angular/core';

import { Migration } from '../sql/migration';
import { InjectorMigrations } from './migrations';
import { SQLService } from '../contracts/sql.service';

@Injectable({
    providedIn: 'root'
})
export class MigrationService {
    /**
     * Display debug messages in the console
     */
    protected debug = false;

    /**
     * Migration pool
     */
    public migrations: Array<Migration>;

    /**
     * Migrated state subject
     */
    protected migrated: BehaviorSubject<boolean>;

    /**
     * Migrated state subscriber
     */
    public migrated$: Observable<boolean>;

    constructor(
        @Optional() @Inject(InjectorMigrations) migrations: Migration[][],
        protected sqlService: SQLService
    ) {
        // Get all migrations from the injected migrations
        this.migrations = (migrations || []).reduce((migrations, module) => {
            return migrations.concat(module);
        }, []);

        // Generate a subject for the migration state
        this.migrated = new BehaviorSubject<boolean>(false);
        // Migration subscriber
        this.migrated$ = this.migrated.asObservable();
    }

    public debugMode(state = true) {
        this.debug = state;
    }

    public migrate(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // Run the local migration pool
            this.runMigrations().then(
                responses => {
                    this.migrated.next(true);

                    resolve(true);
                },
                error => {
                    this.migrated.next(false);

                    reject(error);
                }
            );
        });
    }

    public rollback(): Promise<any> {
        return Promise.reject('No implementation');
    }

    /**
     * Removes all tables and recreates them from scratch
     */
    public rebuildDatabase() {
        return new Promise((resolve, reject) => {
            this.dropTables().then(() => {
                this.runMigrations().then(resolve, reject);
            }, reject);
        });
    }

    /**
     * Run migrations to populate the database with the specified migrations of the _migrations attribute
     */
    protected runMigrations(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // Create a migration table if it does not yet exist
            this.sqlService
                .query(
                    'CREATE TABLE IF NOT EXISTS migrations (name TEXT, batch INTEGER)',
                    []
                )
                .then(() => {
                    // Get the current migration state
                    this.sqlService
                        .query('SELECT * FROM migrations', [])
                        .then(migrated => {
                            this.log('debug', 'Migrations:');
                            this.log('debug', this.migrations);

                            this.log('debug', 'Migrating...');

                            // Handle the pool of migrations
                            this.handleMigrations(
                                this.migrations,
                                migrated.map(
                                    migrated => migrated.name
                                )
                            ).then(responses => {
                                this.log('debug', 'Done');

                                resolve(responses);
                            }, reject);
                        });
                }, reject)
                .catch(reject);
        });
    }

    /**
     * Process and compare the current migration pool with the migration status
     */
    protected handleMigrations(
        migrations: Array<Migration>,
        migrated
    ): Promise<any> {
        return Promise.all(
            migrations.map(migration => {
                // Inject the current SQLService into the migration
                migration.boot(this.sqlService);

                return new Promise<any>((resolve, reject) => {
                    // Handle the migration
                    migration.handle(1, migrated).then(response => {
                        // Handle the migrations that should execute after the above recursively
                        if (migration.after.length > 0) {
                            return this.handleMigrations(
                                migration.after,
                                migrated
                            ).then(responses => {
                                resolve(responses.concat([response]));
                            }, reject);
                        }
                        return resolve(response);
                    }, reject);
                });
            })
        );
    }

    /**
     * Drop all tables that exist
     */
    public dropTables() {
        return new Promise((resolve, reject) => {
            // Get all active tables
            this.sqlService.query(`
                select
                    *
                from sqlite_master
                where type = 'table'
            `, []).then(tables => {
                Promise.all(
                    tables.map(table => {
                        // Prevent any system table from being removed
                        if (
                            table.name !== '__WebKitDatabaseInfoTable__' &&
                            table.name !== 'sqlite_sequence'
                        ) {
                            return this.sqlService.query('DROP TABLE ' + table.name, []);
                        }
                        return Promise.resolve(null);
                    })
                ).then(resolve, reject);
            }, reject);
        });
    }

    /**
     * @deprecated WIP
     */
    protected rollbackMigrations(): Promise<any> {
        return Promise.all(
            this.migrations.map(migration => {
                return migration.handleDown(1, []);
            })
        );
    }

    protected log(severity: string, ...message: any[]): void {
        if (this.debug) {
            console[severity](...message);
        }
    }
}
