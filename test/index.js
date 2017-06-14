const test = require('tape')
const { Logger, transports: { Console } } = require('winston')
const SentryTransport = require('../src')

const dsn = process.env.SENTRY_DSN
  || 'https://1658e7aa9b3743f99d962503cd2a5003:d71d5320b7544ac0a7f61e5e72d8ed7c@sentry.io/179749'
let logger
test('constructor', (t) => {
  t.equal(typeof SentryTransport, 'function')
  const sentryTransport = new SentryTransport({ dsn })
  logger = new Logger({
    transports: [
      new Console(),
      sentryTransport,
    ],
  })
  t.end()
})
test('raven is exposed on logger', (t) => {
  t.equal(typeof logger.transports.sentry.raven, 'object')
  t.end()
})

test('log message', (t) => {
  t.plan(1)
  logger.info('test info message!', (err) => {
    t.error(err)
  })
})

test('log error with empty message', (t) => {
  t.plan(1)
  logger.error('', new Error('error with empty log message'), (err) => {
    t.error(err)
  })
})

test('log error with custom message', (t) => {
  t.plan(1)
  logger.error('custom message', new Error('some test error'), (err) => {
    t.error(err)
  })
})
