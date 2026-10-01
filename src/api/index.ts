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
