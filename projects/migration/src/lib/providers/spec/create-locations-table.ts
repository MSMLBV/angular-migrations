import { Migration } from '../../sql/migration';
import { Schema } from '../../sql/schema';

export class CreateLocationsTable extends Migration {
    public name = 'create_locations_table';

    up(): Array<Promise<any>> {
        return [
            Schema.create('locations', (b) => {
                b.column('id', 'integer', ['PRIMARY', 'AUTO_INCREMENT']);
                b.column('name', 'string');
                b.column('long', 'float');
                b.column('lat', 'float');
            }).execute(this.sql)
        ];
    }

    down(): Array<Promise<any>> {
        return [];
    }
}
