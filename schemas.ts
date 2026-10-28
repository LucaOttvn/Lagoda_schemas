export type OperationOutcome = "tp" | "sl" | "breakeven" | "dayEnd";
export type Direction = "bullish" | "bearish";
export type EntryName = "grey" | "blue" | "orange" | "red";
export type Time = number;
export type LineWidth = 1 | 2 | 3 | 4;
export type EmaHandler = (candle: Candle) => EmaResult;
export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w";

export interface StrategyParams {
  symbol: string;
  timeframe: Timeframe;
  from: string;
  to: string;
  tp: number;
  sl: number
  ema: number
  breakevenTriggerPct?: number;
}

export interface StrategyResult {
  candles: StrategyCandle[]
  records: OperationRecord[];
  stats?: OperationStats;
}

export interface ActiveFib {
  direction: Direction;
  lightGreenLevel: number;
  darkGreenLevel: number;
  orangeLevel: number;
  greyLevel: number;
  blueLevel: number;
  redLevelFirst: number;
  redLevelSecond: number;
  redLevelThird: number;
}

export interface EmaResult {
  value: number;
  newDay: boolean;
}

export interface Gap {
  startTime: number;
  endTime: number;
  topPrice: number;
  bottomPrice: number;
  direction: Direction
}

// - - CANDLES SCHEMAS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

export interface RawCandle {
  v: number,
  vw: number,
  o: number,
  c: number,
  h: number,
  l: number,
  t: number,
  n: number,
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StrategyCandle extends Candle {
  dayHigh: number
  dayLow: number
  moving_average_01: number
  gap: Gap | null
  currentOperation: Operation | null
  darkGreenLine: number
  lightGreenLine: number
  orangeLine: number
  greyLine: number
  blueLine: number
  redLineFirst: number
  redLineSecond: number
  redLineThird: number
}

// - - OPERATION SCHEMAS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

export interface Operation {
  currentlyOpen: boolean;
  completed: boolean;
  entry: OperationEntry
  tp?: number;
  sl?: number;
  direction: Direction;
  outcome?: OperationOutcome;
  // Running most-favorable price reached while the op was open
  bestPrice?: number;
  // Running most-adverse price reached while the op was open
  worstPrice?: number;
  originalSl?: number;
  /** True once the price reaches the breakeven trigger and SL moves to entry. */
  slMovedToBreakeven?: boolean;
}

export interface OperationEntry {
  entryTime: number;
  exitTime?: number;
  entryIndex: number;
  entryPrice?: number;
  entryName: EntryName;
}

export interface OperationRecord {
  id: string;
  dayKey: string;
  direction: Direction;
  entryPrice: number;
  entryTime: number;
  exitPrice: number;
  exitTime: number;
  outcome: OperationOutcome;
  pnlPct: number;
  entryName: EntryName;
  tpPrice?: number;
  slPrice?: number;
  // Best excursion while open (highest high for bullish, lowest low for bearish).
  bestPrice?: number;
  // Worst excursion while open (lowest low for bullish, highest high for bearish).
  worstPrice?: number;
  slCoverage?: number;
  tpCoverage?: number;
}

export interface OperationStats {
  total: number;
  tp: number;
  sl: number;
  breakeven: number;
  dayEnd: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnlPct: number;
  avgPnlPct: number;
  grossWinPct: number;
  grossLossPct: number;
  profitFactor: number;
  winShare: number
  lossShare: number
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 