import { useQuery } from '@tanstack/react-query';
import { http } from './client';
import { queryKeys } from './queryClient';

// What the Credvera team has published for the app: promos, notices and help
// answers. Only approved versions are ever served.

export type PublishedItem = {
  id: string;
  version: number;
  audience: 'everyone' | 'personal' | 'business';
  title: string;
  body: string;
  cta?: string | null;
  link?: string | null;
  updatedAt: string;
};

export type PublishedContent = { promos: PublishedItem[]; notices: PublishedItem[]; help: PublishedItem[] };

export const contentApi = {
  // Public: the same for every business, so no token and no business header needed.
  business: () => http.get<PublishedContent>('/content', { params: { audience: 'business' }, skipAuth: true }),
};

/** Published content for businesses (and everyone). Changes rarely: refreshed every few minutes. */
export function useBusinessContent() {
  return useQuery({ queryKey: queryKeys.content, queryFn: contentApi.business, staleTime: 5 * 60_000 });
}
