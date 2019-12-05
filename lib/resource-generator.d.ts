import 'reflect-metadata';
import * as express from 'express';
import { Container } from 'inversify';
declare type Resource = {
    new (...args: any[]): any;
};
/**
 * Register's a resource on an express app. It mounts the resource at the base path
 * specified by the resource or if supplied basePathOverride.
 *
 * @param app The express app to add the resource too.
 * @param resource A resource to register. This should be the type name not an instance of the type.
 * @param container An inverisfy container to use resolve the resource on each request.
 * @param basePathOverride Used to override the base path set in the resource.
 */
export declare function registerResource(app: express.Application, resource: Resource, container: Container, basePathOverride?: string): void;
export {};
