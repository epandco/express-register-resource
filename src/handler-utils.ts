import { Container } from 'inversify';
import { Dictionary, Request, Response } from 'express-serve-static-core';
import { Logger } from 'pino';
import { CookieBase, ResourceRouteMetadata } from 'resource-decorator';
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
    const reqAny = req as any;
    if (reqAny.local) {
      argArray[localParam.index] = reqAny.local[localParam.name];
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
    // Bind just before resolving the instance
    container.bind<Logger>(TYPES.PinoLogger).toConstantValue(req.log);
    const instance: T = container.resolve(resource);

    // Now unbind and then invoke the resource
    container.unbind(TYPES.PinoLogger);

    const args = resolveArgs(route, req);
    const model = await instance[route.methodKey](...args);

    return model;
  }
  finally {
  }
}

export function handleCookies(model: CookieBase, resp: Response) {
  if (model instanceof CookieBase && model.cookies) {
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