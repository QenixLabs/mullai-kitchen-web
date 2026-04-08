import { useCallback } from 'react';
import { useUserActions, useCurrentUser } from './useUserStore';
import { apiClient } from '@/api/client';

/**
 * Hook to refresh user permissions from the server
 * Call this when user's role or permissions may have changed
 *
 * @returns Object with refreshPermissions function
 *
 * @example
 * const { refreshPermissions } = useRefreshPermissions();
 *
 * await refreshPermissions(); // Updates permissions in store
 */
export function useRefreshPermissions() {
  const { setUser } = useUserActions();
  const currentUser = useCurrentUser();

  const refreshPermissions = useCallback(async () => {
    try {
      const response = await apiClient.get<{ permissions: string[] }>('/auth/permissions');

      // Merge permissions with existing user data
      if (currentUser) {
        setUser({
          ...currentUser,
          permissions: response.data.permissions,
        });
      }
      return true;
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
      return false;
    }
  }, [setUser, currentUser]);

  return { refreshPermissions };
}
