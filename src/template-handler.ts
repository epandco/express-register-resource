import 'reflect-metadata';

import { Container } from 'inversify';
import { Request, Response, Dictionary } from 'express-serve-static-core';
import { ResourceHandler } from './resource-handler';
import { ResourceRouteMetadata, ResourceNotFound, ResourceError, ResourceRedirect, ResourceTemplateContent} from 'resource-decorator';
import { handleCookies, invokeResource } from './handler-utils';


export function templateHandler<T extends { [key: string]: any }>(
  route: ResourceRouteMetadata,
  resource: { new (...args: any[]): T },
  container: Container): ResourceHandler {

  if (!route.resourceRenderer) {
    throw new Error('A resourceRenderer MUST be set on a route before being passed into the apiHandlerFunction');
  }

  const renderer = route.resourceRenderer;

  return async (req: Request<Dictionary<string>>, resp: Response) => {
    resp.setHeader('Content-Type', renderer.contentType);

    try {
      const model = await invokeResource(route, req, resource, container);

      handleCookies(model, resp);

      // Render content returned
      if (!model) { // render empty template
        throw new Error('A template route MUST return a ResourceTemplateRoute');
      } else if (model instanceof ResourceTemplateContent) {
        const rendered = await renderer.ok(model);
        resp.status(200).send(rendered);
      } else if (model instanceof ResourceRedirect) { // redirect
        // The default of the resp.redirect method
        let statusCode = 302;

        if (model.statusCode) {
          statusCode = model.statusCode;
        }

        resp.redirect(statusCode, model.redirectUrl);
      } else {
        throw new Error(`${typeof model} is not a supported response`);
      }

    } catch (error) {
      try {
        if (error instanceof ResourceNotFound) {
          const rendered = await renderer.notFound();
          resp.status(404).send(rendered);
          return;
        }

        if (error instanceof ResourceError) {
          const rendered = await renderer.expectedError(error);
          resp.status(400).send(rendered);
          return;
        }

        // Need to look at logging libraries
        req.log.fatal(error);
        const rendered = await renderer.unexpectedError('Unexpected error occured');
        resp.status(500).send(rendered);
      }
      catch (innerError) {
        req.log.fatal('Fatal error and may not be able to render result', innerError);
        if (!resp.headersSent) {
          resp.status(500).send('Fatal error');
        }
      }
    }
  };
}