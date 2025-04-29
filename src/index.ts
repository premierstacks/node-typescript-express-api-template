import './observability.js';

import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { ATTR_ERROR_TYPE, ATTR_EXCEPTION_MESSAGE, ATTR_EXCEPTION_STACKTRACE, ATTR_EXCEPTION_TYPE } from '@opentelemetry/semantic-conventions';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import type { ErrorRequestHandler, Express, RequestHandler } from 'express';
import express from 'express';

const logger = logs.getLogger('logs');

const PORT: number = parseInt(process.argv[2] ?? process.env['PORT'] ?? '8080');
const app: Express = express();

app.disable('x-powered-by');

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(compress());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const setSecurityHeaders: RequestHandler = (_req, res, next) => {
  if (res.headersSent) {
    next();
    return;
  }

  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Frame-Options', 'deny');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; form-action 'self'; base-uri 'self'; object-src 'none'; style-src 'self'; font-src 'self'; frame-ancestors 'none'; upgrade-insecure-requests; block-all-mixed-content",
  );
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), autoplay=(), camera=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(self), usb=(), web-share=(), xr-spatial-tracking=(), clipboard-read=(), clipboard-write=(), gamepad=(), hid=(), idle-detection=(), interest-cohort=(), serial=(), unload=()',
  );

  next();
};

app.use(setSecurityHeaders);

const setCacheControl: RequestHandler = (_req, res, next) => {
  if (res.headersSent) {
    next();
    return;
  }

  res.setHeader('Cache-Control', 'private, no-store, max-age=0');

  next();
};

app.use(setCacheControl);

const handleOpenapi: RequestHandler = (_req, res) => {
  res.removeHeader('Content-Security-Policy');

  res.render('openapi.ejs', { url: '/static/openapi.json' });
};

app.get('/openapi', handleOpenapi);

app.use('/static', express.static('static'));

const handleNotFound: RequestHandler = (_req, res, next) => {
  if (res.headersSent) {
    next();
    return;
  }

  res.status(404).json({
    errors: [
      {
        status: '404',
        code: '0',
        title: 'Not Found',
      },
    ],
  });
};

app.use(handleNotFound);

const handleError: ErrorRequestHandler = (err, _req, res, next) => {
  let message: string | undefined = undefined;

  if (err instanceof Error) {
    message = err.message;
  } else if (err instanceof String || typeof err === 'string') {
    message = err.toString();
  }

  logger.emit({
    attributes: {
      [ATTR_ERROR_TYPE]: '500',
      [ATTR_EXCEPTION_TYPE]: err instanceof Error ? err.name : undefined,
      [ATTR_EXCEPTION_MESSAGE]: message,
      [ATTR_EXCEPTION_STACKTRACE]: err instanceof Error ? err.stack : undefined,
    },
    severityNumber: SeverityNumber.ERROR,
    severityText: 'ERROR',
    body: message,
  });

  if (res.headersSent) {
    next(err);
    return;
  }

  res.status(500).json({
    errors: [
      {
        status: '500',
        code: '0',
        title: 'Internal Server Error',
      },
    ],
  });
};

app.use(handleError);

app.listen(PORT, () => {
  logger.emit({
    body: `Server listening on port ${PORT.toFixed()} on all network interfaces.`,
    severityNumber: SeverityNumber.INFO,
    severityText: 'INFO',
  });
});
