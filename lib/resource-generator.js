"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express = require("express");
const pino = require("express-pino-logger");
const config_1 = require("./config");
const resource_handler_factory_1 = require("./resource-handler-factory");
const resource_decorator_1 = require("resource-decorator");
const resource_error_handler_1 = require("./resource-error-handler");
const pinoMiddleware = pino({
    level: config_1.pinoLogLevel
});
function getMetadataByKey(key, resource) {
    return Reflect.getMetadata(key, resource.prototype);
}
function getMetadataKeys(resource) {
    return Reflect.getMetadataKeys(resource.prototype);
}
/**
 * Register's a resource on an express app. It mounts the resource at the base path
 * specified by the resource or if supplied basePathOverride.
 *
 * @param app The express app to add the resource too.
 * @param resource A resource to register. This should be the type name not an instance of the type.
 * @param container An inverisfy container to use resolve the resource on each request.
 * @param basePathOverride Used to override the base path set in the resource.
 */
function registerResource(app, resource, container, basePathOverride) {
    const routeKeys = getMetadataKeys(resource).filter((md) => md.startsWith('route-'));
    const resourceName = resource.name;
    const genVersion = getMetadataByKey('resource-generator-version', resource);
    if (!genVersion) {
        throw Error(`${resourceName} is missing the resource decorator. Please check that the class has the decorator on it`);
    }
    else if (genVersion !== 'v1') {
        throw Error(`${resourceName} was generated with an incompatible version of the resource-generator. Expected v1 and got ${genVersion}`);
    }
    console.log(`Generating resource: ${resourceName}`);
    let basePath;
    if (basePathOverride) {
        basePath = basePathOverride;
    }
    else {
        basePath = getMetadataByKey('base-path', resource);
    }
    if (!basePath) {
        basePath = '/';
    }
    console.log(`    base path: ${basePath}`);
    const router = express.Router();
    const resourceMiddleware = getMetadataByKey('express-resource-middleware', resource);
    /**
     *
     * middleware will stack like this per route
     *
     * | Inject Renderer for Route  |
     * | JSON Body parser           | <- If applicable to route
     * | Resource level Middleware  |
     * | Route level Middleware     |
     * | Generated resource Wrapper | <- Always the last function in the chain for a route
     *
     * Then the error handler is the last in the chain and added at the
     * very end once for the entire router.
     * | Resource error handler     |
     *
     */
    for (const key of routeKeys) {
        const route = getMetadataByKey(key, resource);
        const routeMiddleware = getMetadataByKey(`express-route-middleware-${route.methodKey}`, resource);
        console.log(`    adding route: ${route.resourceType} ${route.method.toUpperCase()} ${route.path}`);
        const middleware = [pinoMiddleware];
        if (!route.resourceRenderer) {
            // Get default ResourceRenderer for this resourceType if none is passed in.
            // This will likely be the the normal case.
            route.resourceRenderer = resource_decorator_1.getDefaultRenderer(route.resourceType);
        }
        // Inject the resource renderer into the route to be used
        // downstream
        const resourceRenderer = route.resourceRenderer;
        const injectRouteRenderer = (req, _resp, next) => {
            try {
                if (!req.local) {
                    req.local = {};
                }
                req.local._renderer = resourceRenderer;
                next();
            }
            catch (error) {
                // Let the error handler detect the that the renderer hasn't been set
                // it will log the message and send a generic 500.
                next(error);
            }
        };
        // First thing we do is attach the route renderer to the request
        // if this were to throw an error we would not know what type to handle
        // but it SHOULD NEVER throw an error
        middleware.push(injectRouteRenderer);
        if (route.resourceType == resource_decorator_1.ResourceType.API) {
            // Coercing the type express.json middleware here into the ResourceHandler type
            // this should be ok as the signatures match. ResourceRequest is just a normal Express Request.
            middleware.push(express.json());
        }
        if (resourceMiddleware) {
            middleware.push(...resourceMiddleware);
        }
        if (routeMiddleware) {
            middleware.push(...routeMiddleware);
        }
        let resourceHandler;
        switch (route.resourceType) {
            case resource_decorator_1.ResourceType.API:
            case resource_decorator_1.ResourceType.TEMPLATE:
                resourceHandler = resource_handler_factory_1.resourceHandlerFactory(route, resource, container);
                break;
            case resource_decorator_1.ResourceType.FILE:
                throw new Error('File render types not supported yet');
                break;
            default:
                throw new Error('Unexpected render type');
        }
        middleware.push(resourceHandler);
        router[route.method](route.path, ...middleware);
    }
    router.use(resource_error_handler_1.resourceErrorHandler);
    app.use(basePath, router);
}
exports.registerResource = registerResource;
//# sourceMappingURL=resource-generator.js.map