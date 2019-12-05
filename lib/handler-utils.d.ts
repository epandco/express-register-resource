import { Container } from 'inversify';
import { Dictionary, Request, Response } from 'express-serve-static-core';
import { CookieBase, ResourceRouteMetadata } from 'resource-decorator';
export declare function resolveArgs(route: ResourceRouteMetadata, req: Request<Dictionary<string>>): any[];
export declare function invokeResource<T extends {
    [key: string]: any;
}>(route: ResourceRouteMetadata, req: Request<Dictionary<string>>, resource: {
    new (...args: any[]): T;
}, container: Container): Promise<any>;
export declare function handleCookies(model: CookieBase, resp: Response): void;
