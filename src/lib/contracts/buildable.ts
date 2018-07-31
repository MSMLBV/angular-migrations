export interface Buildable {
    table: string;
    toSql(cases): string[];
}
