"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
function getEnvironmentValue(name) {
    if (process.env[name]) {
        return process.env[name];
    }
    console.log(`Environment variable: ${name} is not set. If using dotenv please check your .env file`);
    return '';
}
exports.pinoLogLevel = getEnvironmentValue('PINO_LOG_LEVEL');
//# sourceMappingURL=config.js.map