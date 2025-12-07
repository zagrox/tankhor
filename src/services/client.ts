import { createDirectus, rest } from '@directus/sdk';
import { DirectusSchema } from '../types/directus';

const CRM_URL = 'https://crm.tankhor.com';

// Initialize the central Directus client
export const directus = createDirectus<DirectusSchema>(CRM_URL).with(rest());

// Centralized helper for constructing asset URLs
export const getAssetUrl = (id: string | undefined) => {
  if (!id) return 'https://placehold.co/400?text=No+Image';
  if (id.startsWith('http')) return id;
  return `${CRM_URL}/assets/${id}`;
};
