/* eslint-disable import/no-extraneous-dependencies */
const winston = require('winston')

const Raven = require('raven')

const defaults = {
  // Maps winston log levels to sentry log levels
  levelsMap: {
    silly: 'debug',
    verbose: 'debug',
    info: 'info',
    debug: 'debug',
    warn: 'warning',
    error: 'error',
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

  log(_level, msg, meta = {}, callback) {
    const level = this.options.levelsMap[_level]

    const extraData = Object.assign({}, meta)
    const tags = extraData.tags
    delete extraData.tags

    const extra = {
      level,
      tags,
      extra: extraData,
    }

    if (extraData.request) {
      extra.request = extraData.request
      delete extraData.request
    }

    if (extraData.user) {
      extra.user = extraData.user
      delete extraData.user
    }

    // Support exceptions logging
    if (level === 'error' && meta instanceof Error) {
      if (msg) {
        meta.message = `${msg}. cause: ${meta.message}`
      }
      Raven.captureException(meta, extra, (err) => {
        callback(err, !err)
      })
      return
    }

    Raven.captureMessage(msg, extra, (err) => {
      callback(err, !err)
    })
  }
}

winston.transports.Sentry = SentryTransport

module.exports = SentryTransport
