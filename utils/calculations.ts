import { CalculatorState, YearlyResult } from '../types';

export const calculateCompoundInterest = (state: CalculatorState): YearlyResult[] => {
  const results: YearlyResult[] = [];
  const {
    initialPrincipal,
    monthlyContribution,
    annualRate,
    yearsToGrow,
    startAge,
    retirementYear,
    monthlyWithdrawal,
    oneTimeEvents,
  } = state;

  let currentBalance = initialPrincipal;
  let totalInvested = initialPrincipal;
  const monthlyRate = annualRate / 100 / 12;

  // Initial state (Year 0)
  results.push({
    year: 0,
    age: startAge,
    totalAssets: currentBalance,
    totalInvested: totalInvested,
    interestEarnedYearly: 0,
    isRetirement: false,
  });

  for (let year = 1; year <= yearsToGrow; year++) {
    let yearStartBalance = currentBalance;
    let yearlyInterest = 0;

    // Check for one-time events happening at the START of this year
    const eventsThisYear = oneTimeEvents.filter((e) => e.year === year);
    eventsThisYear.forEach((e) => {
      // Logic simplified: Events are always considered as flow impacting balance
      // Even if we disallowed withdrawals in UI, the logic keeps it generic
      if (e.type === 'deposit') {
        currentBalance += e.amount;
        totalInvested += e.amount;
      } else {
        currentBalance -= e.amount;
      }
    });

    const isRetirementPhase = year > retirementYear;

    // Monthly loop
    for (let month = 0; month < 12; month++) {
      const interest = currentBalance * monthlyRate;
      currentBalance += interest;
      yearlyInterest += interest;

      if (!isRetirementPhase) {
        currentBalance += monthlyContribution;
        totalInvested += monthlyContribution;
      } else {
        // Retirement phase: Withdraw
        currentBalance -= monthlyWithdrawal;
        // Prevent negative balance from breaking math (optional, but realistic)
        if (currentBalance < 0) currentBalance = 0;
      }
    }

    results.push({
      year,
      age: startAge + year,
      totalAssets: Math.round(currentBalance),
      totalInvested: Math.round(totalInvested),
      interestEarnedYearly: Math.round(yearlyInterest),
      isRetirement: isRetirementPhase,
    });
  }

  return results;
};

export interface MonthlyDetail {
  month: number;
  startBalance: number;
  interest: number;
  contribution: number; // or withdrawal (negative)
  endBalance: number;
}

// Helper to calculate monthly details for a specific year
// We reconstruct the state up to start of that year
export const calculateMonthlyDetails = (state: CalculatorState, targetYear: number): MonthlyDetail[] => {
  const {
    initialPrincipal,
    monthlyContribution,
    annualRate,
    retirementYear,
    monthlyWithdrawal,
    oneTimeEvents,
  } = state;
  
  const monthlyRate = annualRate / 100 / 12;
  let currentBalance = initialPrincipal;

  // 1. Fast forward to start of target year
  for (let year = 1; year < targetYear; year++) {
    const eventsThisYear = oneTimeEvents.filter((e) => e.year === year);
    eventsThisYear.forEach((e) => {
      if (e.type === 'deposit') currentBalance += e.amount;
      else currentBalance -= e.amount;
    });

    const isRetirementPhase = year > retirementYear;

    for (let month = 0; month < 12; month++) {
      currentBalance += currentBalance * monthlyRate;
      if (!isRetirementPhase) currentBalance += monthlyContribution;
      else {
        currentBalance -= monthlyWithdrawal;
        if(currentBalance < 0) currentBalance = 0;
      }
    }
  }

  // 2. Now simulate the target year month by month
  const monthlyResults: MonthlyDetail[] = [];
  
  // Apply one-time events for this specific year start
  const eventsThisYear = oneTimeEvents.filter((e) => e.year === targetYear);
  eventsThisYear.forEach((e) => {
    if (e.type === 'deposit') currentBalance += e.amount;
    else currentBalance -= e.amount;
  });

  const isRetirementPhase = targetYear > retirementYear;

  for (let month = 1; month <= 12; month++) {
    const startBalance = currentBalance;
    const interest = startBalance * monthlyRate;
    
    let cashFlow = 0;
    if (!isRetirementPhase) {
      cashFlow = monthlyContribution;
    } else {
      cashFlow = -monthlyWithdrawal;
    }

    let endBalance = startBalance + interest + cashFlow;
    if (endBalance < 0) endBalance = 0;
    
    currentBalance = endBalance;

    monthlyResults.push({
      month,
      startBalance: Math.round(startBalance),
      interest: Math.round(interest),
      contribution: cashFlow,
      endBalance: Math.round(endBalance),
    });
  }

  return monthlyResults;
};


export const formatCurrency = (val: number) => {
  // Use compact notation for charts, standard for text
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(val);
};

export const formatCompact = (val: number) => {
  return new Intl.NumberFormat('zh-TW', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(val);
};