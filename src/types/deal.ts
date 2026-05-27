export type BusinessType = "RATE_NEW" | "PREPAY";

export type DealStatus =
  | "DRAFT"
  | "OCR_PENDING"
  | "CALCULATING"
  | "CALCULATED"
  | "SUBMITTED_BY_BRANCH"
  | "RECEPTION_PENDING"
  | "RECEPTION_DONE"
  | "REVIEW_PENDING"
  | "REVIEW_DONE"
  | "APPROVAL_PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CONFIRMED"
  | "CANCELLED";

export type RepaymentMethod = "EQUAL_PRINCIPAL" | "EQUAL_PAYMENT" | "BULLET";
export type ProductType = "CORPORATE" | "INDIVIDUAL" | "SPREAD_LOAN" | "OTHER";
export type InterestType = "FIXED" | "TIBOR_SHORT";
export type ExecutionMethod = "PARTIAL" | "FULL" | "CONDITION_CHANGE" | "DEFAULT";
export type Side = "OFFER" | "BID" | "MID";

export interface CustomerInfo {
  customerName: string;
  branchCode: string;
  cifNo: string;
  loanAccountNo: string;
  transactionNo: string;
}

export interface OriginalContract {
  borrowingDate: string;
  maturityDate: string;
  nextPaymentDate: string;
  fixedEndDate: string;
  executionAmount: number;
  contractRate: number;
  repaymentMethod: RepaymentMethod;
  productType: ProductType;
  interestType: InterestType;
}

export interface Schedule {
  interestReceiveType: "PRE" | "POST";
  paymentInterval: "1M" | "3M" | "6M" | "12M" | "OTHER";
  holidayAdjustment: "PRECEDING" | "FOLLOWING" | "NONE";
  contractDate: string;
}

export interface RateInfo {
  internalRate: number;
  customerRate: number;
  spread: number;
}

export interface PrepaymentInfo {
  responsiblePerson: string;
  contact: string;
  requestDate: string;
  answerRequiredDate: string;
  answerDeadline: string;
  prepaymentDate: string;
  executionMethod: ExecutionMethod;
  partialAmount: number | null;
  outstandingBalance: number;
  isSyndicatedLoan: boolean;
  hasFeeReduction: boolean;
  approvalNo: string | null;
  recalculationDate: string | null;
}

export interface DealInput {
  customerInfo: CustomerInfo;
  originalContract: OriginalContract;
  schedule: Schedule;
  rateInfo: RateInfo;
  prepayment: PrepaymentInfo;
  remarks: string;
}

export interface CashFlowItem {
  sequence: number;
  cashflowType: "PRINCIPAL" | "INTEREST" | "A_SIDE" | "B_SIDE";
  cashflowDate: string;
  amount: number;
  discountFactor: number;
  presentValue: number;
  appliedRate: number;
}

export interface AICheckResult {
  logicConsistency: { status: "OK" | "WARN" | "NG"; message: string };
  marketDataValidity: { status: "OK" | "WARN" | "NG"; message: string };
  similarDealComparison: { status: "OK" | "WARN" | "NG"; message: string };
  anomalyDetection: { status: "OK" | "WARN" | "NG"; message: string };
}

export interface CalculationResult {
  prepaymentFee: number;
  sideATotal: number;
  sideBTotal: number;
  pvAdjustedDiff: number;
  appliedCurveType: string;
  appliedTenorBand: string;
  amountBandApplied: string;
  cashflows: CashFlowItem[];
  aiCheckResult: AICheckResult;
  calculatedAt: string;
  marketDataAcquiredAt: string;
  calculationEngineVersion: string;
}

export interface Deal {
  dealId: string;
  dealNo: string;
  businessType: BusinessType;
  status: DealStatus;
  input: DealInput;
  result: CalculationResult | null;
  attachments: Attachment[];
  history: DealHistory[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  receptionAt: string | null;
  receptionBy: string | null;
  reviewAt: string | null;
  reviewBy: string | null;
  approvalAt: string | null;
  approvalBy: string | null;
  confirmedAt: string | null;
  confirmedBy: string | null;
}

export interface Attachment {
  attachmentId: string;
  documentType: "LOAN_DETAIL" | "REPAYMENT_SCHEDULE" | "CUSTOMER_MGMT" | "MARKET_TRANSACTION" | "EXECUTION_INQUIRY" | "OTHER";
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  ocrProcessed: boolean;
  ocrResult: OCRResult | null;
}

export interface OCRResult {
  extractedFields: ExtractedField[];
}

export interface ExtractedField {
  fieldName: string;
  fieldLabel: string;
  formValue: string | number;
  ocrValue: string | number;
  confidence: number;
  hasDifference: boolean;
}

export interface DealHistory {
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
}
