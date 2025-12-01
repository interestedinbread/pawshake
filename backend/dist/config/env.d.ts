/**
 * Centralized environment variable validation and configuration
 *
 * This module validates all required environment variables on startup
 * and exports a typed configuration object. If any required variable
 * is missing, the application will fail to start with a clear error message.
 */
interface EnvConfig {
    openAIApiKey: string;
    jwtSecret: string;
    databaseUrl: string;
    corsOrigin: string;
    port: number;
    chromaUrl: string;
    jwtExpiresIn: string;
}
export declare const env: EnvConfig;
export declare const openAIApiKey: string, jwtSecret: string, databaseUrl: string, corsOrigin: string, port: number, chromaUrl: string, jwtExpiresIn: string;
export {};
//# sourceMappingURL=env.d.ts.map