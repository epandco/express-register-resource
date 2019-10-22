import 'reflect-metadata';

import { Container } from 'inversify';
import { Request, Response, Dictionary } from 'express-serve-static-core';
import { ResourceHandler } from './resource-handler';
import { ResourceRouteMetadata, ResourceResponseWithCookies, ResourceContent, ResourceNotFound, ResourceError } from 'resource-decorator';
import { handleCookies, invokeResource } from './handler-utils';


export function apiHandler<T extends { [key: string]: any }>(
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
      if ( 
        // we have a body
        req.body &&
        // and the content-type is not set or not application/json
        (
          !req.headers["content-type"] ||
          (req.headers["content-type"] && req.headers["content-type"].toLowerCase() !== 'application/json')
        )
      ) {
        resp.status(415).send();
        return;
      }

      const model = await invokeResource(route, req, resource, container);
      if (!model) {
        resp.status(201).send();
        return;
      }

      handleCookies(model, resp);

      if (model instanceof ResourceContent) {
        const rendered = await renderer.ok(model);
        resp.status(200).send(rendered);
      }
      else if (model instanceof ResourceResponseWithCookies) {
        // Only send back the cookies (
        resp.status(201).send();
      }
      else {
        throw new Error(`${typeof model} is not a supported response`);
      }

    } catch (error) {
      try {
        if (error instanceof ResourceNotFound) {
          resp.status(404).send();
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