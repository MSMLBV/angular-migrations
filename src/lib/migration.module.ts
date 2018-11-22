import { NgModule } from '@angular/core';
import { MigrationService } from './providers/migration.service';
import { Migration } from './sql/migration';
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { InjectorMigrations } from './providers/migrations';

// @dynamic
@NgModule({
    imports: [],
    providers: [MigrationService]
})
export class MigrationModule {
    public static forRoot(migrationsFactory: () => Migration[]): ModuleWithProviders {
        return this.forChild(migrationsFactory);
    }

    public static forChild(migrationsFactory: () => Migration[]): ModuleWithProviders {
        return {
            ngModule: MigrationModule,
            providers: [
                {
                    provide: InjectorMigrations,
                    multi: true,
                    useFactory: migrationsFactory
                }
            ]
        };
    }
}
