export type OperationOutcome = "tp" | "sl" | "dayEnd" | "ema" | "be" | "atr";
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
  ema1: number
  ema2: number
  atr: ATR
  // This param represents the percentage of tp coverage that triggers the begin of the EMAs crossing checks.
  emaCrossingTrigger: number;
  // This param represents the percentage of tp coverage that triggers the begin of the breakeven hit check.
  breakevenTrigger: number;
  breakevenMargin: number
  exitStrategy: OperationExitStrategy
}

export interface ATR {
  period: number,
  multiplier: number,
  trigger: number
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
  moving_average_02: number
  atr: number
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
}

export interface OperationEntry {
  entryTime: number;
  exitTime?: number;
  exitPrice?: number;
  entryIndex: number;
  entryPrice?: number;
  entryName: EntryName;
}

export type OperationExitStrategy = 'tp' | 'ema' | 'atr'

export interface OperationRecord {
  id: string;
  dayKey: string;
  direction: Direction;
  entry: OperationEntry;
  outcome: OperationOutcome;
  profitAndLossPercentage: number;
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

  // Total number of operations (trades) executed.
  total: number;
  // Number of trades closed by hitting the standard Take Profit.
  tp: number;
  // Number of trades closed by hitting the standard Stop Loss.
  sl: number;
  // Number of trades closed by the ATR Trailing Stop.
  atr: number;
  // Number of trades closed exactly at the breakeven entry price.
  be: number;
  // Number of trades closed by an EMA crossover exit signal.
  ema: number;
  // Number of trades force-closed at the end of the trading day.
  dayEnd: number;
  // Total number of profitable trades.
  wins: number;
  // Total number of losing trades.
  losses: number;
  // Win rate as a decimal (0.0 to 1.0). Calculated as: wins / (wins + losses). Breakeven trades are excluded.
  winRate: number;
  // Sum of all trades' raw percentage returns (e.g., +4.5 means +4.5% total).
  totalprofitAndLossPercentage: number;
  // The average percentage return per trade.
  avgprofitAndLossPercentage: number;
  // The sum of percentages from winning trades only.
  grossWinPct: number;
  // The sum of percentages from losing trades only (stored as a negative number).
  grossLossPct: number;
  // Total absolute dollars earned from winning trades (net of commissions).
  grossProfit: number;
  // Total absolute dollars lost on losing trades (net of commissions, stored as a negative number).
  grossLoss: number;
  // The actual bottom-line profit in dollars. Calculated as: grossProfit + grossLoss. 
  netProfit: number;
  // Capital efficiency ratio based on dollar amounts: grossProfit / |grossLoss|. A value > 1.0 means the strategy is profitable. Infinity means zero losses.
  profitFactor: number;
  // Percentage of total "movement" (wins + losses) that came from wins (0.0 to 1.0).
  winShare: number;
  // Percentage of total "movement" (wins + losses) that came from losses (0.0 to 1.0).
  lossShare: number;
  // The largest peak-to-trough drop in cumulative percentage PnL. Stored as a positive magnitude (e.g., 5.5 means a 5.5% max drawdown).
  maxDrawdownPct: number;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 