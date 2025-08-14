import winston from 'winston';
import expressWinston from 'express-winston';

// Definisikan dan terapkan warna custom
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'cyan',
  debug: 'white',
});

// Definisikan format log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((log) => `[${log.timestamp}] ${log.level}: ${log.message}`),
  winston.format.colorize({ all: true })
);

// Konfigurasi logger utama
const logger = winston.createLogger({
  level: 'debug', // Tampilkan semua level log untuk development
  transports: [
    new winston.transports.Console({ format: logFormat })
  ],
});

// Konfigurasi middleware HTTP logger dengan level dinamis
const httpLogger = expressWinston.logger({
  winstonInstance: logger,
  msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
  
  level: (req, res) => {
    let level = 'http'; // Default level untuk request sukses
    if (res.statusCode >= 400 && res.statusCode < 500) {
      level = 'warn'; // Untuk client error seperti 404, 401
    }
    if (res.statusCode >= 500) {
      level = 'error'; // Untuk server error
    }
    return level;
  },
});

export { logger, httpLogger };