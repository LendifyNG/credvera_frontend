import { useQuery } from '@tanstack/react-query';
import { http } from './client';
import { queryKeys } from './queryClient';
import { useSignedIn } from './session';
import type { ProfileDto } from './types';

export const profileApi = {
  me: () => http.get<ProfileDto>('/users/me'),
};

/** The signed-in person. Idle while signed out. */
export function useProfile() {
  const signedIn = useSignedIn();

  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: profileApi.me,
    enabled: signedIn,
    staleTime: 5 * 60_000,
  });
}
