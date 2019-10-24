import { Response } from 'express-serve-static-core';
import {
  ResourceError,
  ResourceNotFound,
} from 'resource-decorator';
import { ResourceRequest } from './resource-handler';


export async function resourceErrorHandler(err: any, req: ResourceRequest, resp: Response): Promise<void> {
  const renderer = req.local._renderer;

  if (!renderer) {
    req.log.fatal('Unable to get resource renderer from req.local._renderer.');
    if (!resp.headersSent) {
      resp.status(500).send('fatal error check logs');
      return;
    }
  }

  resp.contentType(renderer.contentType);

  try {
    if (err instanceof ResourceError) {
      const rendered = renderer.expectedError(err);
      resp.status(400).send(rendered);
      return;
    }

    if (err instanceof ResourceNotFound) {
      const rendered = renderer.notFound();
      resp.status(404).send(rendered);
      return;
    }

    if (typeof err === 'string') {
      const rendered = renderer.unexpectedError(err);
      req.log.fatal(err);
      resp.status(500).send(rendered);
      return;
    }
  } catch (error) {
    req.log.fatal('unexpected error');
    req.log.fatal(err);
    if (!resp.headersSent) {
      resp.status(500).send();
    }
  }
}