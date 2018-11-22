
# Angular-migrations

## Installation

Add the package via your favorite package manager

```
$ yarn add @msml/angular-migrations
```

Create a migration

```
// ./create-users-table.migration.ts

import { Migration } from '@msml/angular-migrations';
import { Schema } from '@msml/angular-migrations';

export class CreateUsersTable extends Migration {
    public name = 'create_users_table';
    
    // Create the table
    up(): Array<Promise<any>> {
        return [
            // Configure the schema
            Schema.create('users', (b) => {
                b.column('id', 'integer', ['PRIMARY', 'AUTO_INCREMENT']);
                b.column('name', 'string');
                b.column('email', 'string');
            }).execute(this.sql)
        ];
    }

    // Down migrations are currently not supported
    down(): Array<Promise<any>> {
        return [];
    }
}
```

Add the migration module to your main AppModule
```
// app.module.ts

import { MigrationModule, Migration } from '@msml/angular-migrations'; 

// Import the migration you just created
import { CreateUsersTable } from './create-users-table.migration'

// Create a new factory method that creates your migrations
export function myMigrationFactory(): Migration[] {
    return [
        // Add the migration to the factory
        new CreateUsersTable()
    ];
}

@NgModule({
    imports: [
        //...

        // Insert the module in your root module
        MigrationModule.forRoot(myMigrationsFactory),

        //...
    ]
})
export class AppModule {}
```

Create an SQL service that implements the SQLService (This example only works in browsers)

```
import { SQLService } from '@msml/angular-migrations';

const win: any = window;

export class BrowserSQLiteService implements SQLService {

    protected db;

    constructor() {
        this.db = win.openDatabase(
            '@msml/angular-migrations-test',
            '1.0',
            'database',
            5 * 1024 * 1024
        );
    }

    public query(query: string, bindings: any[]): Promise<{ [key: string]: any }[]> {
        return new Promise((resolve, reject) => {
            this.execute(query, bindings).then(response => {
                const rows: { [key: string]: any }[] = [];

                for (let i = 0; i < response.res.rows.length; i++) {
                    rows.push(response.res.rows.item(i));
                }

                resolve(rows);
            }, response => {
                reject({
                    query: {
                        statement: query,
                        bindings: bindings
                    },
                    err: response.err
                });
            });
        });
    }

    protected execute(query, bindings): Promise<{
        tx: any,
        res: any
    }> {
        return new Promise((resolve, reject) => {
            try {
                // Generate a new transaction
                this.db.transaction(
                    (tx: any) => {
                        // Execute the sql and handle exceptions when it fails
                        tx.executeSql(
                            query,
                            bindings,
                            (tx: any, res: any) => resolve({tx: tx, res: res}),
                            (tx: any, err: any) => reject({tx: tx, err: err})
                        );
                    },
                    (err: any) => {
                        reject({err: err});
                    }
                );
            } catch (err) {
                reject({err: err});
            }
        });
    }
}
```

## Configure

### Nesting

When certain migrations should be executed after another one you can add them in the constructor like: 

```
new CreateUsersTable([
    new AddCreatedAtToUsersTable([
        new removeCreatedAtFromUsersTable(), 
    ]),
    new AddActiveToUsersTable(),
])
```

### Child modules

You can add migrations in child modules using the `forChild` method provided with a factory.

```
// ./modules/fiend/app.module.ts

import { MigrationModule, Migration } from '@msml/angular-migrations'; 

// Import the migration you just created
import { CreateFriendsTable } from './create-friends-table.migration'

// Create a new factory method that creates your migrations
export function myMigrationFactory(): Migration[] {
    return [
        // Add the migration to the factory
        new CreateFriendsTable()
    ];
}

@NgModule({
    imports: [
        //...

        // Insert the module in your root module
        MigrationModule.forChild(myMigrationsFactory),

        //...
    ]
})
export class ChildModule {}
```




