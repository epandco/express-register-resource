import * as dotenv from 'dotenv';

dotenv.config();

function getEnvironmentValue(name: string): string {
  if (process.env[name]) {
    return process.env[name] as string;
  }

  console.log(`Environment variable: ${name} is not set. If using dotenv please check your .env file`);
  return '';
}

export const pinoLogLevel: string = getEnvironmentValue('PINO_LOG_LEVEL');