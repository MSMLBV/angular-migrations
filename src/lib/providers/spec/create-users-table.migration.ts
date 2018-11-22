import { Migration } from '../../sql/migration';
import { Schema } from '../../sql/schema';

export class CreateUsersTable extends Migration {
    public name = 'create_users_table';

    up(): Array<Promise<any>> {
        return [
            Schema.create('users', (b) => {
                b.column('id', 'integer', ['PRIMARY KEY', 'AUTOINCREMENT']);
                b.column('name', 'string');
                b.column('email', 'string');
            }).execute(this.sql)
        ];
    }

    down(): Array<Promise<any>> {
        return [];
    }
}
