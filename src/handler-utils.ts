import { Container } from 'inversify';
import { Request, Response, Dictionary } from 'express-serve-static-core';
import { Logger } from 'pino';
import { ResourceRouteMetadata, ResourceResponseWithCookies } from 'resource-decorator';
import { TYPES } from './di-container';

export function resolveArgs(route: ResourceRouteMetadata, req: Request<Dictionary<string>>): any[] {
  const argArray = new Array<any>(route.totalParameters);

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
    const reqAny: any = <any>(req);
    if (reqAny.local) {
      const value = reqAny.local[localParam.name];
      argArray[localParam.index] = value;
    }
  }

  if (route.bodyParam) {
    argArray[route.bodyParam.index] = body;
  }

  return argArray;
}

export async function invokeResource<T extends { [key: string]: any }>(
    route: ResourceRouteMetadata,
    req: Request<Dictionary<string>>,
    resource: { new (...args: any[]): T },
    container: Container
  ): Promise<any> {

  try {
    if (container.isBound(TYPES.PinoLogger)) {
      // This should never happen with the finally block
      // unbinding.

      req.log.error('PinoLogger was already bound. This should not happen but unbinding to avoid error.');
      container.unbind(TYPES.PinoLogger);
    }

    container.bind<Logger>(TYPES.PinoLogger).toConstantValue(req.log);
    const instance: T = container.resolve(resource);
    const args = resolveArgs(route, req);
    const model = await instance[route.methodKey](...args);

    return model;
  }
  finally {
    container.unbind(TYPES.PinoLogger);
  }
}

export function handleCookies(model: ResourceResponseWithCookies, resp: Response) {
  if (model instanceof ResourceResponseWithCookies && model.cookies) {
    for (const cookie of model.cookies) {
      if (cookie.options) {
        resp.cookie(cookie.name, cookie.value, cookie.options)
      }
      else {
        resp.cookie(cookie.name, cookie.value)
      }
    }
  }
}