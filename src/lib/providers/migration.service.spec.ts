import { TestBed, inject } from '@angular/core/testing';

import { MigrationService } from './migration.service';
import { InjectorMigrations } from './migrations';
import { SQLService as AbstractSQLService } from '../contracts/sql.service';
import { CreateLocationsTable } from './spec/create-locations-table';

describe('MigrationService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MigrationService,
                {
                    provide: AbstractSQLService,
                    useClass: SQLService
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

            service.migrate();
        }
    ));
});

export function migrationsFactory() {
    return [
        new CreateLocationsTable()
    ];
}

export class SQLService implements AbstractSQLService {
    public query(query: string, bindings: any[]): Promise<{ [key: string]: any }[]> {

        console.debug(query, bindings);

        return Promise.resolve([]);
    }
}
