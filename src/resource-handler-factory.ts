import 'reflect-metadata';

import { Container } from 'inversify';
import { Response } from 'express-serve-static-core';
import { ResourceHandler, ResourceRequest } from './resource-handler';
import {
  ResourceContent,
  ResourceRedirect,
  ResourceResponseWithCookies,
  ResourceRouteMetadata,
  ResourceType
} from 'resource-decorator';
import {handleCookies, invokeResource} from './handler-utils';


export function resourceHandlerFactory<T extends { [key: string]: any }>(
  route: ResourceRouteMetadata,
  resource: { new (...args: any[]): T },
  container: Container): ResourceHandler {

  return async (req: ResourceRequest, resp: Response, next: Function) => {
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
      if (!model) {
        resp.status(201).send();
        return;
      }

      handleCookies(model, resp);

      if (model instanceof ResourceRedirect) {
        if (route.resourceType !== ResourceType.TEMPLATE) {
          next(new Error(`ResourceRedirect is not a valid type for ${route.resourceType}`));
          return;
        }
        // The default of the resp.redirect method
        let statusCode = 302;

        if (model.statusCode) {
          statusCode = model.statusCode;
        }

        resp.redirect(statusCode, model.redirectUrl);
      }

      if (model instanceof ResourceContent) {
        const rendered = await renderer.ok(model);
        resp.status(200).send(rendered);
      }
      else if (model instanceof ResourceResponseWithCookies) {
        // Only send back the cookies (
        resp.status(201).send();
      }
      else {
        next(new Error(`${typeof model} is not a supported response`));
        return;
      }

    } catch (error) {
      next(error);
    }
  };
}