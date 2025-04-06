import './observability.js';

import type { ErrorRequestHandler, Express, RequestHandler } from 'express';
import express from 'express';

const PORT: number = parseInt(process.argv[2] ?? process.env['PORT'] ?? '8080');
const app: Express = express();

const handleNotFound: RequestHandler = (_req, res, next) => {
  if (res.headersSent) {
    next();
    return;
  }

  res.status(404).json({
    errors: [
      {
        status: '404',
        title: 'Not Found',
      },
    ],
  });
};

app.use(handleNotFound);

const handleError: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  res.status(500).json({
    errors: [
      {
        status: '500',
        title: 'Internal Server Error',
      },
    ],
  });
};

app.use(handleError);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express is running on http://0.0.0.0:${PORT.toFixed()}`);
});
