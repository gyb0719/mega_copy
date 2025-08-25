interface Config {
    PORT: number;
    NODE_ENV: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    FRONTEND_URL: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    EMAIL_FROM?: string;
    EMAIL_HOST?: string;
    EMAIL_PORT?: number;
    EMAIL_USER?: string;
    EMAIL_PASS?: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    MAX_FILE_SIZE: number;
    ALLOWED_FILE_TYPES: string[];
}
declare const config: Config;
export default config;
export declare const PORT: number, NODE_ENV: string, MONGODB_URI: string, JWT_SECRET: string, JWT_EXPIRES_IN: string, JWT_REFRESH_EXPIRES_IN: string, FRONTEND_URL: string, CLOUDINARY_CLOUD_NAME: string | undefined, CLOUDINARY_API_KEY: string | undefined, CLOUDINARY_API_SECRET: string | undefined, STRIPE_SECRET_KEY: string | undefined, STRIPE_WEBHOOK_SECRET: string | undefined, EMAIL_FROM: string | undefined, EMAIL_HOST: string | undefined, EMAIL_PORT: number | undefined, EMAIL_USER: string | undefined, EMAIL_PASS: string | undefined, RATE_LIMIT_WINDOW_MS: number, RATE_LIMIT_MAX_REQUESTS: number, MAX_FILE_SIZE: number, ALLOWED_FILE_TYPES: string[];
//# sourceMappingURL=index.d.ts.map