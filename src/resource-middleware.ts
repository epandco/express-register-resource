import { ResourceHandler } from './resource-handler';


export function resourceMiddleware(middleware: ResourceHandler[]) {
  return <T extends { new(...args: any[]): {} }>(constructor: T) => {

    Reflect.defineMetadata('express-resource-middleware', middleware, constructor.prototype);

    return constructor;
  };
}