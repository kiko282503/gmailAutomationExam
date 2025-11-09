import { exec } from 'child_process';
import { promisify } from 'util';
import logger from './logger.js';

const execAsync = promisify(exec);

class TOTPGenerator {
  static async generateToken(secretKey) {
    logger.debug('Generating TOTP token');

    const cleanSecretKey = secretKey || "oqjz aair jfkr lgi2 j6rb st56 trgy lwvv";
    const command = `authenticator --key "${cleanSecretKey}"`;
    
    const { stdout, stderr } = await execAsync(command).catch(error => {
      logger.error('Command execution error', error.message);
      return { stdout: '', stderr: error.message };
    });

    const hasError = stderr;
    if (hasError) {
      logger.error('Authenticator error', stderr);
      return { success: false, token: null, error: stderr };
    }

    const lines = stdout.split('\n');
    for (const line of lines) {
      const isTokenLine = line.startsWith('Token:');
      if (isTokenLine) {
        const token = line.split('Token:')[1].trim();

        const isValidFormat = this.validateTokenFormat(token);
        if (isValidFormat) {
          logger.success('Generated TOTP token successfully');
          return { success: true, token, error: null };
        } else {
          logger.warning('Generated token has invalid format');
          return { success: false, token, error: 'Invalid token format' };
        }
      }
    }

    logger.error('Could not extract token from authenticator output');
    return { success: false, token: null, error: 'Token not found in output' };
  }

  static async generateTokenWithRetry(secretKey, maxRetries = 3, retryDelay = 1000) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      logger.debug(`TOTP generation attempt ${attempt}/${maxRetries}`);

      const result = await this.generateToken(secretKey);

      const tokenGenerated = result.success;
      if (tokenGenerated) {
        return { ...result, attempts: attempt };
      }

      lastError = result.error;

      const shouldRetry = attempt < maxRetries;
      if (shouldRetry) {
        logger.info(`Waiting ${retryDelay}ms before retry`);
        await this.sleep(retryDelay);
      }
    }

    logger.error(`Failed to generate TOTP token after ${maxRetries} attempts`);
    return { success: false, token: null, error: lastError, attempts: maxRetries };
  }

  static async getFreshToken(secretKey, waitTime = 2000) {
    logger.info(`Getting fresh TOTP token (waiting ${waitTime}ms)`);

    await this.sleep(waitTime);

    return await this.generateToken(secretKey);
  }

  static validateTokenFormat(token) {
    const hasToken = token;
    if (!hasToken) return false;

    const tokenRegex = /^\d{6}$/;
    return tokenRegex.test(token.toString());
  }

  static async getMultipleTokens(secretKey, count = 3, interval = 1000) {
    const tokens = [];

    for (let i = 0; i < count; i++) {
      logger.debug(`Generating token ${i + 1}/${count}`);

      const result = await this.generateToken(secretKey);

      const tokenGenerated = result.success;
      if (tokenGenerated) {
        tokens.push({
          token: result.token,
          timestamp: new Date().toISOString()
        });
      }

      const shouldWait = i < count - 1;
      if (shouldWait) {
        await this.sleep(interval);
      }
    }

    return tokens;
  }

  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async testAuthenticator(secretKey) {
    logger.info('Testing TOTP functionality');

    const result = await this.generateToken(secretKey);

    const testPassed = result.success;
    if (testPassed) {
      logger.success('TOTP test passed!');
      return true;
    } else {
      logger.error('TOTP test failed', result.error);
      return false;
    }
  }
}

export default TOTPGenerator;

if (import.meta.url === `file://${process.argv[1]}`) {
  logger.error('Demo function has been removed for security reasons. Please use TOTPGenerator.generateToken() directly.');
}