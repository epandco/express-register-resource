import 'reflect-metadata';

import { Container } from 'inversify';
import { Response } from 'express-serve-static-core';
import { ResourceHandler, ResourceRequest } from './resource-handler';
import {
  CookieResponse,
  TemplateResponse,
  ApiResponse,
  ResourceRouteMetadata,
  ResourceType,
  RedirectResponse,
  FileResponse
} from 'resource-decorator';

import { handleCookies, invokeResource } from './handler-utils';
import { Stream } from 'stream';


export function resourceHandlerFactory<T extends { [key: string]: any }>(
  route: ResourceRouteMetadata,
  resource: { new (...args: any[]): T },
  container: Container): ResourceHandler {

  switch(route.resourceType) {
    case ResourceType.API:
      return async (req: ResourceRequest, resp: Response, next: Function): Promise<void> => {
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
            route.resourceType === ResourceType.API &&
            // we have a body
            req.body &&
            // and the content-type is not set or not application/json
            (
              !req.headers['content-type'] ||
              (req.headers['content-type'] && req.headers['content-type'].toLowerCase() !== 'application/json')
            )
          ) {
            resp.status(415).send();
            return;
          }

          const model = await invokeResource(route, req, resource, container);
          handleCookies(model, resp);

          if (model instanceof ApiResponse) {
            const rendered = await renderer.ok(model);
            resp.status(200).send(rendered);
            return;
          }

          if (!model || model instanceof CookieResponse) {
            resp.status(204).send();
            return;
          }

          next(`${typeof model} is not a valid type for ${route.resourceType}`);
        } catch (error) {
          next(error);
        }
      };

      // Intentionally left in even thought it's not reachable DO NOT REMOVE
      break;
    case ResourceType.TEMPLATE:
      return async (req: ResourceRequest, resp: Response, next: Function): Promise<void> => {
        // This gets injected up stream and should already be set!
        const renderer = req.local._renderer;
        if (!renderer) {
          next('Unable to get renderer for route.');
          return;
        }

        resp.contentType(renderer.contentType);

        try {
          const model = await invokeResource(route, req, resource, container);
          handleCookies(model, resp);

          if (!model) {
            next(`${route.resourceType} MUST return something`);
            return;
          }

          if (model instanceof TemplateResponse) {
            const rendered = await renderer.ok(model);
            resp.status(200).send(rendered);
            return;
          }

          if (model instanceof RedirectResponse) {
            // The default of the resp.redirect method
            let statusCode = 302;

            if (model.statusCode) {
              statusCode = model.statusCode;
            }

            resp.redirect(statusCode, model.redirectUrl);
            return;
          }

          next(`${typeof model} is not a valid type for ${route.resourceType}`);
        } catch (error) {
          next(error);
        }
      };

      // Intentionally left in even thought it's not reachable DO NOT REMOVE
      break;
    case ResourceType.FILE:
      return async (req: ResourceRequest, resp: Response, next: Function): Promise<void> => {

        //default this for now
        //will be set later
        resp.contentType('text/html');

        try {

          const model = await invokeResource(route, req, resource, container);

          if (model instanceof FileResponse) {
            if (!model.content) {
              next('No content was provided.');
            }

            if (model.content instanceof Stream) {
                          //TODO- make this optional
              resp.set('Content-disposition', 'attachment; filename=' + model.fileName);
              resp.set('Content-Type', model.contentType);
              model.content.pipe(resp);
              return;
            }

            if (model.content instanceof Buffer) {
              next('Buffer not implemented yet.');
            }

            next(`${typeof model.content} is invalid.`);
            return;
          }

          next(`${typeof model} is not a valid type for ${route.resourceType}`);
        } catch (error) {
          next(error);
        }
      };

      // Intentionally left in even thought it's not reachable DO NOT REMOVE
      break;
    default:
      throw new Error(`${route.resourceType} is not valid.`);
  }
}