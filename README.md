
# Angular-migrations

## Installation

```
    yarn add @msml/angular-migrations
```

```
    import { MigrationModule } from '@msml/angular-migrations'; 

    // Create a new factory method that creates your migrations
    export function myMigrationFactory(): Migration[] {
        return [
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

## Configure





