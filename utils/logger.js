const pino = require('pino');

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  },
});

module.exports = logger;
