import { TestBed, inject } from '@angular/core/testing';

import { MigrationService } from './migration.service';
import { InjectorMigrations } from './migrations';
import { SQLService as AbstractSQLService } from '../contracts/sql.service';
import { CreateUsersTable } from './spec/create-users-table.migration';
import { BrowserSQLiteService } from './spec/browser-sqlite-service';
import { Schema } from '../sql/schema';
import { setTimeout } from 'timers';

describe('MigrationService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MigrationService,
                {
                    provide: AbstractSQLService,
                    useClass: BrowserSQLiteService
                },
                {
                    provide: InjectorMigrations,
                    multi: true,
                    useFactory: migrationsFactory
                }
            ]
        });
    });

    it('should be created', inject(
        [MigrationService],
        (service: MigrationService) => {
            expect(service).toBeTruthy();
        }
    ));

    it('should resolve migrate', inject(
        [MigrationService],
        (service: MigrationService) => {
            let state = null;

            service.migrated$.subscribe(
                migrated => {
                    state = migrated;
                }
            );

            service.migrate();

            setTimeout(() => {
                service.migrate();
            }, 500);
        }
    ));
});

export function migrationsFactory() {
    return [
        new CreateUsersTable()
    ];
}

export class SQLService implements AbstractSQLService {
    public query(query: string, bindings: any[]): Promise<{ [key: string]: any }[]> {

        console.debug(query, bindings);

        return Promise.resolve([]);
    }
}
