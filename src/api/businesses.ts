import { useMutation, useQuery } from '@tanstack/react-query';
import { http } from './client';
import { queryClient, queryKeys } from './queryClient';
import { useSignedIn } from './session';
import type { BusinessDocumentType, BusinessDto, UpdateBusinessInput } from './types';

export const businessesApi = {
  list: () => http.get<BusinessDto[]>('/businesses'),
  get: (id: string) => http.get<BusinessDto>(`/businesses/${id}`),
  start: (rcNumber: string) => http.post<BusinessDto>('/businesses', { rcNumber }),
  update: (id: string, input: UpdateBusinessInput) => http.patch<BusinessDto>(`/businesses/${id}`, input),
  verifyPerson: (id: string, personId: string, bvn: string) => http.post<BusinessDto>(`/businesses/${id}/people/${personId}/bvn`, { bvn }),
  uploadDocument: (id: string, type: BusinessDocumentType, file: File) => {
    const form = new FormData();
    form.append('type', type);
    form.append('file', file);
    return http.post<BusinessDto>(`/businesses/${id}/documents`, form);
  },
  submit: (id: string) => http.post<BusinessDto>(`/businesses/${id}/submit`),
};

/** The businesses this person runs, with where each application stands. */
export function useBusinesses() {
  const signedIn = useSignedIn();
  return useQuery({ queryKey: queryKeys.businesses, queryFn: businessesApi.list, enabled: signedIn });
}

/**
 * Every change answers with the whole application, so the cache is updated
 * from the response instead of being refetched.
 */
function remember(business: BusinessDto) {
  queryClient.setQueryData(queryKeys.business(business.id), business);
  queryClient.setQueryData<BusinessDto[]>(queryKeys.businesses, (list) =>
    list ? [business, ...list.filter((b) => b.id !== business.id)] : [business],
  );
}

export const useStartBusiness = () => useMutation({ mutationFn: businessesApi.start, onSuccess: remember });

export const useUpdateBusiness = () =>
  useMutation({ mutationFn: ({ id, input }: { id: string; input: UpdateBusinessInput }) => businessesApi.update(id, input), onSuccess: remember });

export const useVerifyPerson = () =>
  useMutation({
    mutationFn: ({ id, personId, bvn }: { id: string; personId: string; bvn: string }) => businessesApi.verifyPerson(id, personId, bvn),
    onSuccess: remember,
  });

export const useUploadBusinessDocument = () =>
  useMutation({
    mutationFn: ({ id, type, file }: { id: string; type: BusinessDocumentType; file: File }) => businessesApi.uploadDocument(id, type, file),
    onSuccess: remember,
  });

export const useSubmitBusiness = () => useMutation({ mutationFn: businessesApi.submit, onSuccess: remember });
