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
})

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

### Supported metadata

```javascript
{
  user, // user object
  req, // http request object
  tags, // sentry tags, must be mapping of string -> string
  extra, // sentry extra, can be arbitrary JSON
  fingerprint, // used by sentry to group errors
  // ...
  // unknown props are merged with extra
}
```

### Reporting exceptions

When logging an error, there are three ways to pass the error and
metadata:

- By assigning known properties directly to the error object

```javascript
const err = new Error('some error')
err.user = user
err.req = req
err.tags = { foo: 'bar' }
logger.error('oops!', err)
```

- By passing the error as the message (this might break other
    transports)

```javascript
const err = new Error('some error')
logger.error(err, { user, req, tags: { foo: 'bar' } })
```

- **Recommended**: by passing the error as an `err` property on the metadata

```javascript
const err = new Error('some error')
logger.error('oops!', {
  err,
  user,
  req,
  tags: { foo: 'bar' },
})
```

When logging an error, the error's message will be concatenated with the
message passed to the Winston logger, following the following format:
`{msg} cause: {err.message}`, e.g.:

```javascript
logger.error('Oops!', new Error('some error'))
```

will show the following error message in sentry:

```
Oops! cause: some error
```

