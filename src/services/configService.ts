
import { readSingleton } from '@directus/sdk';
import { directus } from './client';
import { AppConfiguration } from '../types';

/**
 * Fetches the global application configuration from the 'configuration' singleton.
 */
export const fetchAppConfiguration = async (): Promise<AppConfiguration> => {
  const config = await directus.request(
    readSingleton('configuration', {
      fields: ['*', 'app_logo', 'app_hero'],
    })
  );
  return config as AppConfiguration;
};
