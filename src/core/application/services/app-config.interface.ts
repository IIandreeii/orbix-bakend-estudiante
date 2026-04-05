export interface IAppConfig {
  get<T = string>(key: string): T | undefined;
}

export const I_APP_CONFIG = 'IAppConfig';
