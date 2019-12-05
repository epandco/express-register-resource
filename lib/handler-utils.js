"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_decorator_1 = require("resource-decorator");
const di_container_1 = require("./di-container");
function resolveArgs(route, req) {
    const argArray = new Array(route.totalParameters);
    const pathParameters = req.params;
    const queryParameters = req.query;
    const body = req.body || null;
    for (const pathParam of route.pathParams) {
        const value = pathParameters[pathParam.name];
        argArray[pathParam.index] = value;
    }
    for (const queryParam of route.queryParams) {
        const value = queryParameters[queryParam.name];
        argArray[queryParam.index] = value;
    }
    for (const localParam of route.localParams) {
        // casting to any since request may not have 'local' as parameter
        // local being used to pass things between middleware
        const reqAny = req;
        if (reqAny.local) {
            argArray[localParam.index] = reqAny.local[localParam.name];
        }
    }
    if (route.bodyParam) {
        argArray[route.bodyParam.index] = body;
    }
    return argArray;
}
exports.resolveArgs = resolveArgs;
async function invokeResource(route, req, resource, container) {
    // Bind just before resolving the instance
    container.bind(di_container_1.TYPES.PinoLogger).toConstantValue(req.log);
    const instance = container.resolve(resource);
    // Now unbind and then invoke the resource
    container.unbind(di_container_1.TYPES.PinoLogger);
    const args = resolveArgs(route, req);
    const model = await instance[route.methodKey](...args);
    return model;
}
exports.invokeResource = invokeResource;
function handleCookies(model, resp) {
    if (model instanceof resource_decorator_1.CookieBase && model.cookies) {
        for (const cookie of model.cookies) {
            if (cookie.options) {
                resp.cookie(cookie.name, cookie.value, cookie.options);
            }
            else {
                resp.cookie(cookie.name, cookie.value);
            }
        }
    }
}
exports.handleCookies = handleCookies;
//# sourceMappingURL=handler-utils.js.map