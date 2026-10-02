// The app's only door to the backend. Screens import from here.
export { http } from './client';
export { ApiError, errorMessage, isApiError } from './errors';
export { session, useSignedIn } from './session';
export { invalidateMoney, queryClient, queryKeys } from './queryClient';

export { authApi, useSignIn, useSignOut, type SignInInput } from './auth';
export { profileApi, useProfile } from './profile';
export { useOpenWallet, useProvisionVirtualAccount, useVirtualAccount, useWallets, walletsApi } from './wallets';
export { transactionsApi, useTransactions } from './transactions';
export { transfersApi, useAccountName, useBanks, useSendMoney, useTransferQuote } from './transfers';
export {
  billsApi,
  useBuyAirtime,
  useBuyData,
  useBuyElectricity,
  useDataBundles,
  useElectricityProviders,
  useMeterLookup,
  type AirtimeInput,
  type DataInput,
  type ElectricityInput,
  type MeterLookupInput,
} from './bills';

export type * from './types';

export { activeBusiness, useActiveBusinessId } from './activeBusiness';
export {
  businessesApi,
  useBusinesses,
  useStartBusiness,
  useSubmitBusiness,
  useUpdateBusiness,
  useUploadBusinessDocument,
  useVerifyPerson,
} from './businesses';
export {
  paymentLinksApi,
  useCancelPaymentLink,
  useCheckout,
  useCreatePaymentLink,
  usePaymentLinkCurrencies,
  usePaymentLinks,
  usePublicInvoice,
  type CreatePaymentLinkInput,
  type PaymentLinkDto,
  type PaymentLinkStatus,
  type PublicInvoiceDto,
} from './paymentLinks';
export { contentApi, useBusinessContent, type PublishedContent, type PublishedItem } from './content';
export { securityApi, useChangePassword, useChangePin, useSignOutEverywhere, type ChangePasswordInput, type ChangePinInput } from './security';
export { onboardingApi, useFinishSignUp, useRegister, useResendCode, useVerifyCode, type AddressInput, type RegisterInput } from './onboarding';
export {
  serviceRequestsApi,
  useCancelServiceRequest,
  useRequestClosure,
  useRequestStatement,
  useServiceRequest,
  useServiceRequests,
  type OfficialStatement,
  type ServiceRequestDto,
  type ServiceRequestKind,
  type ServiceRequestStatus,
  type StatementLine,
  type StatementRequestInput,
} from './serviceRequests';
export {
  suppliersApi,
  useArchiveSupplier,
  useChangeSupplierBank,
  useCreateSupplier,
  usePaySupplier,
  useSupplier,
  useSuppliers,
  useUpdateSupplier,
  type NewSupplier,
  type PaySupplierInput,
  type SupplierContact,
  type SupplierDetail,
  type SupplierDto,
  type SupplierPayment,
} from './suppliers';
export {
  teamApi,
  useAcceptInvitation,
  useChangeRole,
  useInvitation,
  useInvite,
  useRemoveMember,
  useRevokeInvitation,
  useTeam,
  type InvitationView,
  type InviteResult,
  type TeamDto,
  type TeamRole,
} from './team';
export {
  approvalsApi,
  useApprovals,
  useApprove,
  useCancelApproval,
  useReject,
  useSetThreshold,
  type ApprovalDto,
  type ApprovalStatus,
  type ApprovalsDto,
} from './approvals';
