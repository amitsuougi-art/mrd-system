'use client';

import React, { useState } from 'react';
import type { DealInput, ValidationError } from '@/lib/calculationEngine';

interface DealFormProps {
  onSubmit: (data: DealInput) => void;
  isLoading?: boolean;
  errors?: ValidationError[];
}

const DealForm: React.FC<DealFormProps> = ({ onSubmit, isLoading = false, errors = [] }) => {
  const [formData, setFormData] = useState<DealInput>({
    dealNo: '',
    customerName: '',
    branchCode: '',
    transactionNo: '',
    executionAmount: 0,
    executionDate: '',
    fixedEndDate: '',
    contractRate: 0,
    paymentInterval: '1M',
    firstPaymentDate: '',
    firstRepaymentDate: '',
    interestReceiveType: 'POST',
    holidayAdjustment: 'FOLLOWING',
    internalRate: 0.5,
    customerRate: 0,
    prepaymentDate: '',
    outstandingBalance: 0,
    repaymentType: 'FULL',
    baseRate: 'TIBOR',
    side: 'BID',
  });

  const errorMap = errors.reduce((acc, err) => {
    acc[err.field] = err.message;
    return acc;
  }, {} as Record<string, string>);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Amount') || name.includes('Rate') || name.includes('Balance')
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid">
        <div className="card">
          <h2>取引先情報</h2>

          <div className="form-group">
            <label htmlFor="customerName">取引先名</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="株式会社テスト"
            />
            {errorMap.customerName && <div className="error-text">{errorMap.customerName}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="branchCode">元帳店番</label>
            <input
              type="text"
              id="branchCode"
              name="branchCode"
              value={formData.branchCode}
              onChange={handleChange}
              placeholder="001"
              maxLength={3}
            />
            {errorMap.branchCode && <div className="error-text">{errorMap.branchCode}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="transactionNo">取扱番号</label>
            <input
              type="text"
              id="transactionNo"
              name="transactionNo"
              value={formData.transactionNo}
              onChange={handleChange}
              placeholder="1000000"
              maxLength={10}
            />
            {errorMap.transactionNo && <div className="error-text">{errorMap.transactionNo}</div>}
          </div>
        </div>

        <div className="card">
          <h2>原契約情報</h2>

          <div className="form-group">
            <label htmlFor="executionAmount">実行金額（円）</label>
            <input
              type="number"
              id="executionAmount"
              name="executionAmount"
              value={formData.executionAmount}
              onChange={handleChange}
              step="100000"
              min="0"
            />
            {errorMap.executionAmount && <div className="error-text">{errorMap.executionAmount}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="executionDate">実行日</label>
            <input
              type="date"
              id="executionDate"
              name="executionDate"
              value={formData.executionDate}
              onChange={handleChange}
            />
            {errorMap.executionDate && <div className="error-text">{errorMap.executionDate}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="fixedEndDate">固定期日</label>
            <input
              type="date"
              id="fixedEndDate"
              name="fixedEndDate"
              value={formData.fixedEndDate}
              onChange={handleChange}
            />
            {errorMap.fixedEndDate && <div className="error-text">{errorMap.fixedEndDate}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="contractRate">約定金利（%）</label>
            <input
              type="number"
              id="contractRate"
              name="contractRate"
              value={formData.contractRate}
              onChange={handleChange}
              step="0.001"
              min="0"
            />
            {errorMap.contractRate && <div className="error-text">{errorMap.contractRate}</div>}
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h2>繰上返済条件</h2>

          <div className="form-group">
            <label htmlFor="prepaymentDate">繰上返済予定日</label>
            <input
              type="date"
              id="prepaymentDate"
              name="prepaymentDate"
              value={formData.prepaymentDate}
              onChange={handleChange}
            />
            {errorMap.prepaymentDate && <div className="error-text">{errorMap.prepaymentDate}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="outstandingBalance">借入残高（円）</label>
            <input
              type="number"
              id="outstandingBalance"
              name="outstandingBalance"
              value={formData.outstandingBalance}
              onChange={handleChange}
              step="100000"
              min="0"
            />
            {errorMap.outstandingBalance && <div className="error-text">{errorMap.outstandingBalance}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="repaymentType">返済区分</label>
            <select
              id="repaymentType"
              name="repaymentType"
              value={formData.repaymentType}
              onChange={handleChange}
            >
              <option value="FULL">全部返済</option>
              <option value="PARTIAL">一部返済</option>
            </select>
          </div>
        </div>

        <div className="card">
          <h2>計算条件</h2>

          <div className="form-group">
            <label htmlFor="baseRate">ベースレート</label>
            <select
              id="baseRate"
              name="baseRate"
              value={formData.baseRate}
              onChange={handleChange}
            >
              <option value="LIBOR">LIBOR</option>
              <option value="TIBOR">TIBOR</option>
              <option value="OIS">OIS</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="side">サイド指定</label>
            <select
              id="side"
              name="side"
              value={formData.side}
              onChange={handleChange}
            >
              <option value="BID">Bid（買値）</option>
              <option value="OFFER">Offer（売値）</option>
              <option value="MID">Mid（中値）</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="internalRate">内部レート（%）</label>
            <input
              type="number"
              id="internalRate"
              name="internalRate"
              value={formData.internalRate}
              onChange={handleChange}
              step="0.001"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerRate">顧客向け金利（%）</label>
            <input
              type="number"
              id="customerRate"
              name="customerRate"
              value={formData.customerRate}
              onChange={handleChange}
              step="0.001"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="button-group">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? '計算中...' : '試算実行'}
        </button>
      </div>
    </form>
  );
};

export default DealForm;
