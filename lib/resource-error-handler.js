"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_decorator_1 = require("resource-decorator");
async function resourceErrorHandler(err, req, resp, _next) {
    const renderer = req.local._renderer;
    if (!renderer) {
        req.log.fatal('Unable to get resource renderer from req.local._renderer.');
        req.log.fatal(err, 'Error passed in.');
        if (!resp.headersSent) {
            resp.status(500).send('fatal error check logs');
            return;
        }
    }
    resp.contentType(renderer.contentType);
    try {
        if (err instanceof resource_decorator_1.ResourceError) {
            const rendered = await renderer.expectedError(err);
            resp.status(400).send(rendered);
            return;
        }
        if (err instanceof resource_decorator_1.ResourceNotFound) {
            const rendered = await renderer.notFound();
            resp.status(404).send(rendered);
            return;
        }
        if (err instanceof resource_decorator_1.ResourceUnauthorized) {
            const rendered = await renderer.unauthorized();
            resp.status(401).send(rendered);
            return;
        }
        req.log.fatal(err);
        const rendered = await renderer.fatalError('Fatal error please check logs');
        resp.status(500).send(rendered);
        return;
    }
    catch (error) {
        req.log.fatal('unexpected error');
        req.log.fatal(err);
        if (!resp.headersSent) {
            resp.status(500).send();
        }
    }
}
exports.resourceErrorHandler = resourceErrorHandler;
//# sourceMappingURL=resource-error-handler.js.map