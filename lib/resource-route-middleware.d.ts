import { ResourceHandler } from './resource-handler';
export declare function resourceRouteMiddleware(middleware: ResourceHandler[]): <T>(target: T, key: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
