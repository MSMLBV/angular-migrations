export interface Migration {
    name: string;
    handle(batch: number, migrated: Array<string>): Promise<any>;
//    handleDown(batch: number, migrated: Array<string>): Promise<any>
}
