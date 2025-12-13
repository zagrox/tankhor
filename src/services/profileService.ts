
import { readItems, updateItem, createItem } from '@directus/sdk';
import { directus } from './client';
import { DirectusProfile } from '../types/directus';

export const profileService = {
  /**
   * Get the profile associated with the current user.
   * Assumes Directus permissions are configured so users can only read their own profile.
   */
  getMyProfile: async (): Promise<DirectusProfile | null> => {
    try {
      const result = await directus.request(readItems('profiles', {
        limit: 1,
      })) as unknown as DirectusProfile[];
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  },

  /**
   * Update an existing profile.
   */
  updateProfile: async (id: number, data: Partial<DirectusProfile>) => {
    try {
      return await directus.request(updateItem('profiles', id, data));
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },
  
  /**
   * Create a profile (fallback if it doesn't exist).
   */
  createProfile: async (data: Partial<DirectusProfile>) => {
    try {
      return await directus.request(createItem('profiles', data));
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  }
};
