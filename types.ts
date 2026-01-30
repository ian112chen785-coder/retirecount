export type EventType = 'deposit' | 'withdrawal';

export interface OneTimeEvent {
  id: string;
  year: number; // Relative year (e.g., Year 5)
  amount: number;
  type: EventType;
  name: string;
}

export interface CalculatorState {
  initialPrincipal: number;
  monthlyContribution: number;
  annualRate: number;
  yearsToGrow: number;
  startAge: number;
  retirementYear: number; // The relative year when contribution stops and withdrawal starts
  monthlyWithdrawal: number;
  inflationRate: number; // New: Inflation rate percentage
  oneTimeEvents: OneTimeEvent[];
}

export interface YearlyResult {
  year: number;
  age: number;
  totalAssets: number;
  totalInvested: number;
  interestEarnedYearly: number;
  purchasingPower: number; // New: Real value adjusted for inflation
  isRetirement: boolean;
}

export interface SavedScenario {
  id: string;
  name: string;
  date: string;
  data: CalculatorState;
}