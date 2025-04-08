export interface AppConfig {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  nodeEnv: string;
  isProduction: boolean;
}
