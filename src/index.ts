import './observability.js';

import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import type { ErrorRequestHandler, Express, RequestHandler } from 'express';
import express from 'express';

const PORT: number = parseInt(process.argv[2] ?? process.env['PORT'] ?? '8080');
const app: Express = express();

app.disable('x-powered-by');

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
  logs.getLogger('logs').emit({
    body: `Server listening on port ${PORT.toFixed()} on all network interfaces.`,
    severityNumber: SeverityNumber.INFO,
    severityText: 'INFO',
  });
});
