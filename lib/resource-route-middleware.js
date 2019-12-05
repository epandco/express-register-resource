"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resourceRouteMiddleware(middleware) {
    return (target, key, descriptor) => {
        Reflect.defineMetadata(`express-route-middleware-${key}`, middleware, target);
        return descriptor;
    };
}
exports.resourceRouteMiddleware = resourceRouteMiddleware;
//# sourceMappingURL=resource-route-middleware.js.map