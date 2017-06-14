[![Build Status](https://travis-ci.org/binded/the-best-winston-sentry.svg?branch=master)](https://travis-ci.org/binded/the-best-winston-sentry)

# the-best-winston-sentry

The best [winston logger](https://github.com/winstonjs/winston)
transport for Sentry / Raven 😁

## Install

```bash
npm i the-best-winston-sentry
```

## Usage

Follow this sample configuration to use:

```javascript
const winston = require('winston')
const SentryTransport = require('the-best-winston-sentry')

const sentryTransport = new SentryTransport({
  level: 'warn',
  dsn: '{{ YOUR SENTRY DSN }}',
  tags: { key: 'value' },
  extra: { key: 'value' },
})

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({level: 'silly'}),
    sentryTransport,
  ],
});

// raven can be accessed from the transport object:
sentryTransport.raven
// or
logger.transports.sentry.raven
```

To catch and report all uncaught errors to Sentry with, simply set the
`patchGlobal` option to `true` and it will call `Raven.install()`:

```javascript
new SentryTransport({ patchGlobal: true })
```

Winston logging levels are mapped to the default sentry levels like this:

```javascript
{
    silly: 'debug',
    verbose: 'debug',
    info: 'info',
    debug: 'debug',
    warn: 'warning',
    error: 'error'
}
```

You can customize how log levels are mapped using the `levelsMap` option:

```javascript
new Sentry({
  levelsMap: {
    verbose: 'info',
  },
})
```

### Reporting exceptions

To report exceptions, use the `error` log level and pass
the error object as the second argument, e.g.:

```javascript
logger.error('Oops!', new Error('some error'))
```

If the log message is not an empty, like in the example above, the
reported error's message have the following format: `{msg} cause:
{err.message}`, e.g.:

```
Oops! cause: some error
```
