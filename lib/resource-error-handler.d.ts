import { Response } from 'express-serve-static-core';
import { ResourceRequest } from './resource-handler';
export declare function resourceErrorHandler(err: any, req: ResourceRequest, resp: Response, _next: Function): Promise<void>;
