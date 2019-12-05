"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const resource_decorator_1 = require("resource-decorator");
const handler_utils_1 = require("./handler-utils");
function resourceHandlerFactory(route, resource, container) {
    switch (route.resourceType) {
        case resource_decorator_1.ResourceType.API:
            return async (req, resp, next) => {
                // This gets injected up stream and should already be set!
                const renderer = req.local._renderer;
                if (!renderer) {
                    next('Unable to get renderer for route.');
                    return;
                }
                resp.contentType(renderer.contentType);
                try {
                    if (
                    // if we are a API route
                    route.resourceType === resource_decorator_1.ResourceType.API &&
                        // we have a body
                        req.body &&
                        // and the content-type is not set or not application/json
                        (!req.headers['content-type'] ||
                            (req.headers['content-type'] && req.headers['content-type'].toLowerCase() !== 'application/json'))) {
                        resp.status(415).send();
                        return;
                    }
                    const model = await handler_utils_1.invokeResource(route, req, resource, container);
                    handler_utils_1.handleCookies(model, resp);
                    if (model instanceof resource_decorator_1.ApiResponse) {
                        const rendered = await renderer.ok(model);
                        resp.status(200).send(rendered);
                        return;
                    }
                    if (!model || model instanceof resource_decorator_1.CookieResponse) {
                        resp.status(204).send();
                        return;
                    }
                    next(`${typeof model} is not a valid type for ${route.resourceType}`);
                }
                catch (error) {
                    next(error);
                }
            };
            // Intentionally left in even thought it's not reachable DO NOT REMOVE
            break;
        case resource_decorator_1.ResourceType.TEMPLATE:
            return async (req, resp, next) => {
                // This gets injected up stream and should already be set!
                const renderer = req.local._renderer;
                if (!renderer) {
                    next('Unable to get renderer for route.');
                    return;
                }
                resp.contentType(renderer.contentType);
                try {
                    const model = await handler_utils_1.invokeResource(route, req, resource, container);
                    handler_utils_1.handleCookies(model, resp);
                    if (!model) {
                        next(`${route.resourceType} MUST return something`);
                        return;
                    }
                    if (model instanceof resource_decorator_1.TemplateResponse) {
                        const rendered = await renderer.ok(model);
                        resp.status(200).send(rendered);
                        return;
                    }
                    if (model instanceof resource_decorator_1.RedirectResponse) {
                        // The default of the resp.redirect method
                        let statusCode = 302;
                        if (model.statusCode) {
                            statusCode = model.statusCode;
                        }
                        resp.redirect(statusCode, model.redirectUrl);
                        return;
                    }
                    next(`${typeof model} is not a valid type for ${route.resourceType}`);
                }
                catch (error) {
                    next(error);
                }
            };
            // Intentionally left in even thought it's not reachable DO NOT REMOVE
            break;
        default:
            throw new Error(`${route.resourceType} is not valid.`);
    }
}
exports.resourceHandlerFactory = resourceHandlerFactory;
//# sourceMappingURL=resource-handler-factory.js.map