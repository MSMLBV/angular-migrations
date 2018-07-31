
export abstract class SQLService {
    abstract query(query: string, bindings: any[]): Promise<{ [key: string]: any }[]>;
}
