import { Builder } from './builder';

export class DropBuilder extends Builder {

        /**
         * Generate drop statement
         */
        public getDropStatement(cases): string {
            return this.statement('drop', cases);
        }

        /**
         * Generate SQL with certain cases.
         */
        public toSql(cases): string[] {
            return [
                this.getDropStatement(cases)
            ];
        }
    }
