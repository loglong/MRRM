import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

export interface AiPermissionConfig {
  ai_employee: {
    keys: Array<{
      id: string;
      key: string;
      orgId: string;
      name: string;
      enabled: boolean;
      ipWhitelist: string[];
    }>;
    permissions: Array<{
      endpoint: string;
      methods: string[];
      rateLimit: string;
    }>;
  };
}

export function loadAiConfig(): AiPermissionConfig {
  const configPath = path.join(__dirname, 'ai-permissions.yml');
  const fileContents = fs.readFileSync(configPath, 'utf8');
  return yaml.load(fileContents) as AiPermissionConfig;
}