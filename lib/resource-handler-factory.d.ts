import 'reflect-metadata';
import { Container } from 'inversify';
import { ResourceHandler } from './resource-handler';
import { ResourceRouteMetadata } from 'resource-decorator';
export declare function resourceHandlerFactory<T extends {
    [key: string]: any;
}>(route: ResourceRouteMetadata, resource: {
    new (...args: any[]): T;
}, container: Container): ResourceHandler;
