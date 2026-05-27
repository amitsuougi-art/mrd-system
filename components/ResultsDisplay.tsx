'use client';

import React from 'react';
import type { CalculationResult } from '@/lib/calculationEngine';

interface ResultsDisplayProps {
  result: CalculationResult;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onReset }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(value);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('ja-JP');
  };

  return (
    <div className="result-section">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '15px', color: '#667eea' }}>計算結果</h2>
        <div className="status-badge status-calculated">計算完了</div>
      </div>

      <div className="grid">
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#667eea' }}>取引情報</h3>
          <div className="result-item">
            <span className="result-label">取引番号</span>
            <span>{result.dealNo}</span>
          </div>
          <div className="result-item">
            <span className="result-label">取引先名</span>
            <span>{result.customerName}</span>
          </div>
          <div className="result-item">
            <span className="result-label">計算ステータス</span>
            <span>{result.status}</span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#667eea' }}>タイムスタンプ</h3>
          <div className="result-item">
            <span className="result-label">計算時刻</span>
            <span style={{ fontSize: '12px' }}>{formatDate(result.calculatedAt)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">市場データ時刻</span>
            <span style={{ fontSize: '12px' }}>{formatDate(result.marketDataTime)}</span>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#667eea' }}>金額計算結果</h3>
          <div className="result-item">
            <span className="result-label">Side A (当初利息)</span>
            <span style={{ color: '#0066cc' }}>{formatCurrency(result.sideATotal)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Side B (再投資利息)</span>
            <span style={{ color: '#0066cc' }}>{formatCurrency(result.sideBTotal)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">PV調整差額</span>
            <span style={{ color: '#0066cc' }}>{formatCurrency(result.pvAdjustedDiff)}</span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#667eea' }}>期限前弁済手数料</h3>
          <div style={{ padding: '20px 0', textAlign: 'center', borderBottom: '2px solid #667eea' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>手数料額</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
              {formatCurrency(result.prepaymentFee)}
            </div>
          </div>
          <div className="result-item" style={{ marginTop: '15px' }}>
            <span className="result-label">適用カーブタイプ</span>
            <span>{result.appliedCurveType}</span>
          </div>
          <div className="result-item">
            <span className="result-label">キャッシュフロー数</span>
            <span>{result.cashflowCount}</span>
          </div>
        </div>
      </div>

      <div className="button-group">
        <button type="button" className="btn-primary" onClick={onReset}>
          新規計算
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
