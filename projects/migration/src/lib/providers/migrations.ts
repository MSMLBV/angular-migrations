import { InjectionToken } from '@angular/core';
import { Migration } from '../contracts/migration';

export let InjectorMigrations = new InjectionToken<Migration[][]>('msml.projects.migration');
