/**
 * What the backend sends, field for field.
 *
 * Amounts arrive as decimal strings ("3420750.0000") because the ledger is
 * exact to four places; convert them at the edge with `Number()` only for
 * display. Kept apart from the dashboard's own view models on purpose, so a
 * backend rename is fixed in one mapper rather than in every screen.
 */

export type Decimal = string;
export type IsoDate = string;

// ── Auth ─────────────────────────────────────────────────────────────────────

export type SignInResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; roles: string[]; kycStatus: string; status: string };
};

// ── Profile ──────────────────────────────────────────────────────────────────

export type KycTier = 'none' | 'tier_1' | 'tier_2' | 'tier_3';
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type ProfileDto = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  gender: string | null;
  address: {
    houseNumber: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    nearestLandmark: string | null;
  };
  biometricsEnabled: boolean;
  status: string;
  onboardingStage: string;
  kyc: { tier: KycTier; status: KycStatus; bvnVerified: boolean };
  editable: { name: boolean; address: boolean; biometrics: boolean };
  createdAt: IsoDate;
};

// ── Wallets and pay-in accounts ──────────────────────────────────────────────

export type WalletDto = {
  id: string;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  ledgerAccount: { id: string; balance: Decimal };
  createdAt: IsoDate;
};

export type VirtualAccountStatus = 'unprovisioned' | 'pending' | 'active' | 'declined' | 'failed' | 'closed';

export type VirtualAccountDto = {
  status: VirtualAccountStatus;
  currency: string;
  accountNumber: string | null;
  accountName: string | null;
  bankCode: string | null;
  bankName: string | null;
  countryCode: string | null;
  rails?: { iban?: string; swiftBic?: string; sortCode?: string; routingNumber?: string; bankAddress?: string };
  provider: string;
  provisionedAt: IsoDate | null;
  /** Why it isn't usable yet, in words for the customer. */
  unavailableReason: string | null;
};

export type CreateWalletResponse = {
  message: string;
  wallet: WalletDto;
  virtualAccount: VirtualAccountDto | null;
};

// ── Transactions ─────────────────────────────────────────────────────────────

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'airtime' | 'data' | 'electricity';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'reversed';

/** Free-form per type; the fields below are the ones the backend writes today. */
export type TransactionMetadata = {
  // Transfers
  destinationAccount?: string;
  destinationBank?: string;
  bankName?: string;
  accountName?: string;
  amount?: number;
  fee?: number;
  // Bills
  phoneNumber?: string;
  network?: string;
  bundleValue?: string;
  meterReference?: string;
  providerMessage?: string;
  // Deposits
  source?: string;
  provider?: string;
  senderName?: string | null;
  payerName?: string | null;
  reason?: string | null;
};

export type TransactionDto = {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: Decimal;
  currency: string;
  status: TransactionStatus;
  reference: string;
  metadata: TransactionMetadata | null;
  createdAt: IsoDate;
};

export type Page<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

// ── Transfers ────────────────────────────────────────────────────────────────

export type BankDto = { code: string; name: string };

export type AccountNameDto = { accountName: string; accountNumber: string; bankCode: string; bankName: string };

export type TransferQuoteDto = { amount: number; fee: number; total: number; currency: string; estimatedDelivery: string };

export type SendMoneyInput = {
  bankCode: string;
  accountNumber: string;
  /** Naira, at most two decimal places. */
  amount: string;
  narration?: string;
  pin: string;
};

/** owner: opened it. admin: pays, approves, runs the team. payer: pays (big ones wait). viewer: looks only. */
export type BusinessRole = 'owner' | 'admin' | 'payer' | 'viewer';

/** A payment over the business's approval limit: nothing has moved yet. */
export type AwaitingApprovalDto = {
  status: 'awaiting_approval';
  message: string;
  approvalId: string;
  amount: Decimal;
  fee: Decimal;
  accountName: string;
  accountNumber: string;
  bankName: string;
  expiresAt: IsoDate;
};

export type TransferResultDto = {
  message: string;
  reference: string;
  status: 'pending' | 'success' | 'failed' | 'reversed';
  amount: Decimal;
  fee: Decimal;
  totalDebited: Decimal;
  accountName: string;
  accountNumber: string;
  bankName: string;
  estimatedDelivery: string | null;
};

// ── Bills ────────────────────────────────────────────────────────────────────

export type Network = 'MTN' | 'GLO' | 'AIRTEL' | '9MOBILE';
export type MeterType = 'prepaid' | 'postpaid';

export type DataBundleDto = {
  plan_name: string;
  bundle_value: string;
  bundle_validity: string;
  bundle_description: string;
  /** Naira, as a string. */
  bundle_price: string;
  plan_code: string;
  network: string;
};

export type ElectricityProviderDto = { code: string; name: string; logo_url: string | null };

export type MeterDto = {
  /** Consumed by the purchase in place of the meter number. */
  reference: string;
  customerName: string;
  address: string;
  minimumVend: number;
  outstandingDebt: string;
  meterType: string;
  provider: string;
};

export type BillResultDto = {
  message: string;
  transactionId: string;
  reference: string;
  status: TransactionStatus;
  type: TransactionType;
  amount: Decimal;
  currency: string;
  providerReference: string | null;
};

// ── Businesses ───────────────────────────────────────────────────────────────

export type BusinessStatus = 'draft' | 'pending' | 'second_review' | 'more_info' | 'approved' | 'rejected';
export type BusinessDocumentType = 'certificate_of_incorporation' | 'status_report' | 'memart' | 'proof_of_address';

export type BusinessPersonDto = {
  id: string;
  name: string;
  isDirector: boolean;
  sharePercent: number | null;
  /** Directors, and owners of 25% or more, must have their BVN checked. */
  requiresVerification: boolean;
  status: 'pending' | 'verified' | 'failed';
  /** Masked: `•••••••4455`. */
  bvn: string | null;
  nameMatch: boolean | null;
  failureReason: string | null;
};

export type BusinessDto = {
  id: string;
  rcNumber: string;
  name: string;
  companyType: string | null;
  registeredOn: string | null;
  registeredAddress: string | null;
  cacStatus: string | null;
  industry: string | null;
  description: string | null;
  staffSize: string | null;
  tradingAddress: string | null;
  website: string | null;
  purpose: string | null;
  annualTurnover: string | null;
  sourceOfFunds: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: BusinessStatus;
  submittedAt: IsoDate | null;
  /** Set once the account was closed at the owner’s request. */
  closedAt: IsoDate | null;
  /** Naira payments of this much or more need a second person; null when approvals are off. */
  approvalThreshold: Decimal | null;
  /** What you can do on this business: you opened it, or your role on its team. */
  role: BusinessRole;
  /** Why it was rejected, or what the reviewer asked for. */
  decisionNote: string | null;
  people: BusinessPersonDto[];
  documents: { id: string; type: BusinessDocumentType; label: string; fileName: string; uploadedAt: IsoDate }[];
  editable: boolean;
  /** What still stands between the application and review, in words. */
  missing: string[];
  createdAt: IsoDate;
};

export type UpdateBusinessInput = Partial<
  Pick<BusinessDto, 'industry' | 'description' | 'staffSize' | 'tradingAddress' | 'website' | 'purpose' | 'annualTurnover' | 'sourceOfFunds' | 'contactEmail' | 'contactPhone'>
>;
