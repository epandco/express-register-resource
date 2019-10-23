import {ResourceHandler} from './resource-handler';


export function resourceRouteMiddleware(middleware: ResourceHandler[]) {
  return <T>(target: T, key: string, descriptor: TypedPropertyDescriptor<any>) => {
    Reflect.defineMetadata(`express-route-middleware-${key}`, middleware, target);

    return descriptor;
  };
}
