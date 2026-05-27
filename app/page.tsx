'use client';

import React, { useState } from 'react';
import DealForm from '@/components/DealForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import { calculatePrepaymentFee, validateDealInput, generateDealNumber, type DealInput, type CalculationResult, type ValidationError } from '@/lib/calculationEngine';

export default function Home() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSubmit = async (data: DealInput) => {
    setIsLoading(true);
    setGlobalError(null);
    setErrors([]);

    try {
      // Generate deal number if not provided
      const dealData = {
        ...data,
        dealNo: data.dealNo || generateDealNumber(),
      };

      // Validate input
      const validationErrors = validateDealInput(dealData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }

      // Calculate prepayment fee
      const calculationResult = calculatePrepaymentFee(dealData);
      setResult(calculationResult);
      setErrors([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '計算処理でエラーが発生しました';
      setGlobalError(errorMessage);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrors([]);
    setGlobalError(null);
  };

  return (
    <main>
      <header>
        <h1>期限前弁済手数料計算システム</h1>
        <p>固定金利ローンの期限前弁済手数料を計算します</p>
      </header>

      {globalError && (
        <div className="alert alert-error">
          <strong>エラー:</strong> {globalError}
        </div>
      )}

      {result ? (
        <ResultsDisplay result={result} onReset={handleReset} />
      ) : (
        <DealForm onSubmit={handleSubmit} isLoading={isLoading} errors={errors} />
      )}
    </main>
  );
}
