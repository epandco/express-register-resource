"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resourceMiddleware(middleware) {
    return (constructor) => {
        Reflect.defineMetadata('express-resource-middleware', middleware, constructor.prototype);
        return constructor;
    };
}
exports.resourceMiddleware = resourceMiddleware;
//# sourceMappingURL=resource-middleware.js.map