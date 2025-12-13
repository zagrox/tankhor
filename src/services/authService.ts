
import { login as sdkLogin, logout, readMe, createUser, updateMe } from '@directus/sdk';
import { directus, getAssetUrl } from './client';
import { UserProfile } from '../types';

const DEFAULT_USER_ROLE = 'b042d4b6-dd08-4459-a257-88ebe6696bd6';

export const authService = {
  /**
   * Log in with email and password
   */
  login: async (email: string, password: string) => {
    try {
      // FIX: Use `request(sdkLogin(...))` instead of `directus.login(...)` helper.
      // The helper function in the current SDK version has a bug where it treats the password string
      // as the 'options' object, causing a "Cannot use 'in' operator" error.
      // By manually requesting and setting the token, we bypass this issue entirely.
      // Note: sdkLogin (the REST command) expects a payload object { email, password }, not separate arguments.
      const response = await directus.request(sdkLogin({ email, password }));
      
      if (response && response.access_token) {
        await directus.setToken(response.access_token);
      }

      // After login, fetch the user details
      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   */
  register: async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    roleId?: string
  ) => {
    try {
      // Use the provided role ID or fallback to the hardcoded default
      const roleToAssign = roleId || DEFAULT_USER_ROLE;

      // Create the user
      await directus.request(createUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: roleToAssign,
        status: 'active'
      }));

      // Auto login after registration
      return await authService.login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  /**
   * Log out the current user
   */
  logout: async () => {
    try {
      await directus.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // We generally ignore logout errors and just clear local state
    }
  },

  /**
   * Get the current authenticated user's profile
   */
  getCurrentUser: async (): Promise<UserProfile | null> => {
    try {
      // Request 'readMe' to get current user info
      const result = await directus.request(readMe({
        fields: ['id', 'first_name', 'last_name', 'email', 'avatar', 'role']
      }));

      return {
        id: result.id,
        first_name: result.first_name || '',
        last_name: result.last_name || '',
        email: result.email || '',
        avatar: result.avatar ? getAssetUrl(result.avatar) : undefined,
        role: result.role as string // Directus role ID
      };
    } catch (error) {
      // If we can't read 'me', user is likely not logged in or token expired
      return null;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<UserProfile>) => {
    try {
      // Map frontend fields back to Directus fields if necessary
      const directusData: any = {};
      if (data.first_name) directusData.first_name = data.first_name;
      if (data.last_name) directusData.last_name = data.last_name;
      
      const result = await directus.request(updateMe(directusData));
      return result;
    } catch (error) {
      console.error('Update profile failed', error);
      throw error;
    }
  }
};
