// backend/utils/logger.js (modificado)

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.logDir = options.logDir || path.join(__dirname, '../logs');
    this.logLevel = options.logLevel || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
    this.timeZone = options.timeZone || 'America/Argentina/Buenos_Aires';
    
    // Crear directorio de logs si no existe
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }
  
  getLocalTime() {
    // Obtener la fecha actual en la zona horaria especificada
    const now = new Date();
    const options = { timeZone: this.timeZone };
    
    // Formato local con zona horaria
    const localTimeString = now.toLocaleString('es-AR', options);
    
    // También mantener UTC para compatibilidad
    const utcTimeString = now.toISOString();
    
    return {
      local: localTimeString,
      utc: utcTimeString
    };
  }
  
  formatMessage(level, message, details) {
    const times = this.getLocalTime();
    return JSON.stringify({
      timestamp: times.utc,
      timestamp_local: times.local,
      level,
      message,
      ...details
    });
  }
  
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }
  
  log(level, message, details = {}) {
    if (!this.shouldLog(level)) return;
    
    const formattedMessage = this.formatMessage(level, message, details);
    
    // Log a consola
    console.log(formattedMessage);
    
    // Log a archivo
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${date}.log`);
    
    fs.appendFileSync(logFile, formattedMessage + '\n');
  }
  
  error(message, details = {}) {
    this.log('error', message, details);
  }
  
  warn(message, details = {}) {
    this.log('warn', message, details);
  }
  
  info(message, details = {}) {
    this.log('info', message, details);
  }
  
  debug(message, details = {}) {
    this.log('debug', message, details);
  }
}

module.exports = new Logger({
  timeZone: 'America/Argentina/Buenos_Aires'
});