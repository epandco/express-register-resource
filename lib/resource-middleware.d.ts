import { ResourceHandler } from './resource-handler';
export declare function resourceMiddleware(middleware: ResourceHandler[]): <T extends new (...args: any[]) => {}>(constructor: T) => T;
