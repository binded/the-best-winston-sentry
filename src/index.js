/* eslint-disable import/no-extraneous-dependencies */
const winston = require('winston')
const Raven = require('raven')
const { omit, pick } = require('./utils')

const defaults = {
  // Maps winston log levels to sentry log levels
  levelsMap: {
    silly: 'debug',
    verbose: 'debug',
    info: 'info',
    debug: 'debug',
    warn: 'warning',
    error: 'error',
    fatal: 'error',
  },
}

const handleRavenError = (e) => {
  winston.warn('Raven failed to upload to Sentry: ', {
    name: e.name,
    message: e.message,
    stack: e.stack,
    reason: e.reason,
    statusCode: e.statusCode,
  })
}

class SentryTransport extends winston.Transport {
  constructor(opts = {}) {
    const {
      level,
      dsn = '',
      patchGlobal = false,
      logger = 'root',
      levelsMap = defaults.levelsMap,
      tags = {},
      extra = {},
    } = opts

    const options = {
      level,
      dsn,
      patchGlobal,
      logger,
      tags,
      extra,
      levelsMap: Object.assign({}, defaults.levelsMap, levelsMap),
    }

    super(options)

    // Default options
    this.options = options
    this.name = 'sentry'
    this.raven = Raven

    Raven.config(dsn, options)

    if (patchGlobal) Raven.install()

    // Handle errors
    Raven.on('error', handleRavenError)
  }

  _parseArgs(winstonLevel, msg = '', meta = {}, err) {
    if (meta instanceof Error) {
      const e = meta
      return this._parseArgs(winstonLevel, msg, {
        user: e.user,
        req: e.req,
        tags: e.tags,
        extra: e.extra,
        fingerprint: e.fingerprint,
      }, e)
    }
    if (meta.err instanceof Error) {
      return this._parseArgs(winstonLevel, msg, omit(meta, ['err']), meta.err)
    }
    if (msg instanceof Error) {
      return this._parseArgs(winstonLevel, '', meta, msg)
    }
    // logger.error('some message') -> convert to error to get
    // stacktrace, etc.
    if (winstonLevel === 'error' && !err) {
      return this._parseArgs(winstonLevel, '', meta, new Error(msg))
    }

    if (err && msg) {
      err.message = `${msg}. cause: ${err.message}`
    }

    // `extra` can contain arbitrary JSON data, while
    // `tags` must be a string -> string mapping

    const level = this.options.levelsMap[winstonLevel]
    const rootKeys = ['user', 'req', 'tags', 'extra', 'fingerprint']
    const attrs = Object.assign(
      {
        level,
      },
      // known root keys
      pick(meta, rootKeys),
      // unknown keys go to extra prop
      {
        extra: Object.assign({}, omit(meta, rootKeys), meta.extra),
      },
      !meta.user && meta.req && meta.req.user ? { user: meta.req.user } : {},
    )

    return { attrs, message: msg, err }
  }

  log(level, msg, meta = {}, callback) {
    const { attrs, err, message } = this._parseArgs(level, msg, meta)
    if (err) {
      return Raven.captureException(err, attrs, callback)
    }
    Raven.captureMessage(message, attrs, callback)
  }
}

winston.transports.Sentry = SentryTransport

module.exports = SentryTransport
