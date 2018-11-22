import { SQLService } from '../../contracts/sql.service';

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
