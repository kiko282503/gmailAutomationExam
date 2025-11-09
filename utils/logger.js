/**
 * Centralized Logger for Gmail Automation
 * Provides secure logging with automatic filtering of sensitive information
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, `automation-${this.formatDate()}.log`);
    this.sensitivePatterns = [
      // Email patterns
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      // Password patterns (common password indicators)
      /password["\s]*[:=]["\s]*[^"\s,}]+/gi,
      /passwd["\s]*[:=]["\s]*[^"\s,}]+/gi,
      /pwd["\s]*[:=]["\s]*[^"\s,}]+/gi,
      // Token patterns
      /token["\s]*[:=]["\s]*[^"\s,}]+/gi,
      /totp["\s]*[:=]["\s]*[^"\s,}]+/gi,
      /secret["\s]*[:=]["\s]*[^"\s,}]+/gi,
      /key["\s]*[:=]["\s]*[^"\s,}]+/gi,
      // 6-digit TOTP codes
      /\b\d{6}\b/g,
      // URLs with tokens or sensitive parameters
      /https?:\/\/[^\s]*[?&](token|key|secret|auth|code|totp)=[^\s&]*/gi,
      // Base64 encoded strings (likely tokens)
      /[A-Za-z0-9+\/]{20,}={0,2}/g,
      // Common secret patterns
      /[a-z]{4}\s[a-z]{4}\s[a-z]{4}\s[a-z]{4}\s[a-z]{4}\s[a-z]{4}\s[a-z]{4}\s[a-z]{4}/gi
    ];
    
    this.setupLogDirectory();
  }

  setupLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatDate() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  sanitizeMessage(message) {
    let sanitized = String(message);
    
    // Replace sensitive patterns with masked values
    this.sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, (match) => {
        if (match.includes('@')) {
          // Email masking
          const [username, domain] = match.split('@');
          return `${username.charAt(0)}***@${domain}`;
        } else if (/\b\d{6}\b/.test(match)) {
          // TOTP code masking
          return '***6-digit-code***';
        } else if (match.toLowerCase().includes('password')) {
          // Password field masking
          return match.replace(/[:=]["\s]*[^"\s,}]+/gi, ': ***PASSWORD***');
        } else if (match.toLowerCase().includes('token')) {
          // Token masking
          return match.replace(/[:=]["\s]*[^"\s,}]+/gi, ': ***TOKEN***');
        } else if (match.toLowerCase().includes('secret')) {
          // Secret masking
          return match.replace(/[:=]["\s]*[^"\s,}]+/gi, ': ***SECRET***');
        } else if (match.toLowerCase().includes('key')) {
          // Key masking
          return match.replace(/[:=]["\s]*[^"\s,}]+/gi, ': ***KEY***');
        } else if (match.startsWith('http')) {
          // URL with sensitive parameters
          const url = new URL(match);
          const sensitiveParams = ['token', 'key', 'secret', 'auth', 'code', 'totp'];
          sensitiveParams.forEach(param => {
            if (url.searchParams.has(param)) {
              url.searchParams.set(param, '***');
            }
          });
          return url.toString();
        } else {
          // Generic masking for other patterns
          return '***SENSITIVE***';
        }
      });
    });

    return sanitized;
  }

  writeLog(level, message, context = '') {
    const timestamp = this.formatTimestamp();
    const sanitizedMessage = this.sanitizeMessage(message);
    const sanitizedContext = context ? this.sanitizeMessage(context) : '';
    
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${sanitizedMessage}${sanitizedContext ? ` | Context: ${sanitizedContext}` : ''}\n`;
    
    try {
      fs.appendFileSync(this.logFile, logEntry, 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  info(message, context = '') {
    this.writeLog('INFO', message, context);
    console.log(`ℹ️  ${this.sanitizeMessage(message)}`);
  }

  success(message, context = '') {
    this.writeLog('SUCCESS', message, context);
    console.log(`✅ ${this.sanitizeMessage(message)}`);
  }

  warning(message, context = '') {
    this.writeLog('WARNING', message, context);
    console.log(`⚠️  ${this.sanitizeMessage(message)}`);
  }

  error(message, context = '') {
    this.writeLog('ERROR', message, context);
    console.log(`❌ ${this.sanitizeMessage(message)}`);
  }

  debug(message, context = '') {
    if (process.env.DEBUG === 'true') {
      this.writeLog('DEBUG', message, context);
      console.log(`🔍 ${this.sanitizeMessage(message)}`);
    }
  }

  step(stepName, details = '') {
    this.writeLog('STEP', `${stepName}${details ? ` - ${details}` : ''}`, '');
    console.log(`🔄 ${stepName}${details ? ` - ${this.sanitizeMessage(details)}` : ''}`);
  }

  testStart(testName) {
    this.writeLog('TEST_START', `Starting test: ${testName}`, '');
    console.log(`🚀 Starting test: ${testName}`);
  }

  testEnd(testName, duration = '') {
    this.writeLog('TEST_END', `Completed test: ${testName}${duration ? ` | Duration: ${duration}` : ''}`, '');
    console.log(`🏁 Completed test: ${testName}${duration ? ` | Duration: ${duration}` : ''}`);
  }

  action(actionName, target = '') {
    this.writeLog('ACTION', `${actionName}${target ? ` on ${target}` : ''}`, '');
    console.log(`⚡ ${actionName}${target ? ` on ${this.sanitizeMessage(target)}` : ''}`);
  }

  verification(message, result = '') {
    this.writeLog('VERIFICATION', `${message}${result ? ` | Result: ${result}` : ''}`, '');
    console.log(`🔍 ${message}${result ? ` | Result: ${this.sanitizeMessage(result)}` : ''}`);
  }

  performance(operation, duration) {
    this.writeLog('PERFORMANCE', `${operation} took ${duration}ms`, '');
    console.log(`⏱️  ${operation} took ${duration}ms`);
  }

  separator() {
    const line = '='.repeat(80);
    this.writeLog('SEPARATOR', line, '');
    console.log(line);
  }

  // Clean old log files (keep only last 7 days)
  cleanOldLogs() {
    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Failed to clean old log files', error.message);
    }
  }

  // Get current log file path for external access
  getLogFilePath() {
    return this.logFile;
  }

  // Create a new log entry for test sessions
  startSession(sessionId = '') {
    const session = sessionId || `session-${Date.now()}`;
    this.separator();
    this.info(`New automation session started: ${session}`);
    this.separator();
    return session;
  }

  endSession(sessionId = '') {
    this.separator();
    this.info(`Automation session ended: ${sessionId || 'unknown'}`);
    this.separator();
  }
}

// Create singleton instance
const logger = new Logger();

// Clean old logs on startup
logger.cleanOldLogs();

export default logger;