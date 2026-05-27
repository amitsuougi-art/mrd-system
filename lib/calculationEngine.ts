// Simplified calculation engine for demo
// 業務②：期限前弁済手数料の計算（デモ用簡略版）

export interface DealInput {
  dealNo: string;
  customerName: string;
  branchCode: string;
  transactionNo: string;
  executionAmount: number;
  executionDate: string;
  fixedEndDate: string;
  contractRate: number;
  paymentInterval: string;
  firstPaymentDate: string;
  firstRepaymentDate: string;
  interestReceiveType: string;
  holidayAdjustment: string;
  internalRate: number;
  customerRate: number;
  prepaymentDate: string;
  outstandingBalance: number;
  repaymentType: string;
  baseRate: string;
  side: string;
}

export interface CalculationResult {
  dealNo: string;
  customerName: string;
  status: 'CALCULATED';
  calculatedAt: string;
  marketDataTime: string;
  prepaymentFee: number;
  sideATotal: number;
  sideBTotal: number;
  pvAdjustedDiff: number;
  appliedCurveType: string;
  cashflowCount: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Validate input data
export function validateDealInput(input: DealInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.customerName?.trim()) {
    errors.push({ field: 'customerName', message: '取引先名は必須です' });
  }

  if (!input.branchCode?.trim()) {
    errors.push({ field: 'branchCode', message: '元帳店番は必須です' });
  }

  if (!input.transactionNo?.trim()) {
    errors.push({ field: 'transactionNo', message: '取扱番号は必須です' });
  }

  if (input.executionAmount <= 0) {
    errors.push({ field: 'executionAmount', message: '実行金額は0より大きい値を入力してください' });
  }

  if (!input.executionDate) {
    errors.push({ field: 'executionDate', message: '実行日は必須です' });
  }

  if (!input.fixedEndDate) {
    errors.push({ field: 'fixedEndDate', message: '固定期日は必須です' });
  }

  if (new Date(input.fixedEndDate) <= new Date(input.executionDate)) {
    errors.push({ field: 'fixedEndDate', message: '固定期日は実行日より後の日付を入力してください' });
  }

  if (input.contractRate < 0) {
    errors.push({ field: 'contractRate', message: '約定金利は0以上の値を入力してください' });
  }

  if (input.outstandingBalance <= 0) {
    errors.push({ field: 'outstandingBalance', message: '借入残高は0より大きい値を入力してください' });
  }

  if (new Date(input.prepaymentDate) < new Date(input.executionDate)) {
    errors.push({ field: 'prepaymentDate', message: '繰上返済予定日は当日以降を入力してください' });
  }

  if (new Date(input.prepaymentDate) > new Date(input.fixedEndDate)) {
    errors.push({ field: 'prepaymentDate', message: '繰上返済予定日は固定期日以前を入力してください' });
  }

  return errors;
}

// Calculate prepayment fee (simplified demo version)
export function calculatePrepaymentFee(input: DealInput): CalculationResult {
  // Validate first
  const errors = validateDealInput(input);
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
  }

  // Calculate days remaining
  const executionDate = new Date(input.executionDate);
  const fixedEndDate = new Date(input.fixedEndDate);
  const prepaymentDate = new Date(input.prepaymentDate);

  const totalDays = Math.floor((fixedEndDate.getTime() - executionDate.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.floor((fixedEndDate.getTime() - prepaymentDate.getTime()) / (1000 * 60 * 60 * 24));

  // Simple interest calculation (demo)
  // A: Expected interest if no prepayment
  const annualInterest = input.executionAmount * (input.contractRate / 100);
  const sideATotal = annualInterest * (totalDays / 365);

  // B: Re-investment interest (using market rates - simplified)
  const marketRate = input.internalRate; // Using internal rate as proxy
  const sideBTotal = input.outstandingBalance * (marketRate / 100) * (remainingDays / 365);

  // Calculate present value of difference
  const diff = sideATotal - sideBTotal;
  const discountRate = marketRate / 100 / 365 * remainingDays;
  const pvAdjustedDiff = Math.max(0, Math.round(diff / (1 + discountRate) * 100) / 100);

  // Round to nearest yen
  const prepaymentFee = Math.round(pvAdjustedDiff);

  return {
    dealNo: input.dealNo,
    customerName: input.customerName,
    status: 'CALCULATED',
    calculatedAt: new Date().toISOString(),
    marketDataTime: new Date().toISOString(),
    prepaymentFee,
    sideATotal: Math.round(sideATotal),
    sideBTotal: Math.round(sideBTotal),
    pvAdjustedDiff: Math.round(pvAdjustedDiff),
    appliedCurveType: input.baseRate === 'TIBOR' ? 'TIBOR_SWAP_BID' : 'INTERNAL_RATE',
    cashflowCount: Math.ceil(totalDays / 30),
  };
}

// Generate deal number
export function generateDealNumber(): string {
  const now = new Date();
  const yyyymmdd = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const nnnnn = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `${yyyymmdd}-${nnnnn}`;
}
