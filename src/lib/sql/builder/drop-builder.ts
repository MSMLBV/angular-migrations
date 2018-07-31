import { Builder } from './builder';
import { Column } from '../column';

export class DropBuilder extends Builder {

        /**
         * Generate drop statement
         */
        public getDropStatement(cases) {
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
