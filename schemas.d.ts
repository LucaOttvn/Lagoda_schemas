export type OperationOutcome = "tp" | "sl" | "breakeven" | "dayEnd";
export type Direction = "bullish" | "bearish";
export type EntryName = "grey" | "blue" | "orange" | "red";
export type Time = number;
export type LineWidth = 1 | 2 | 3 | 4;
export type EmaHandler = (candle: Candle) => EmaResult;

export interface StrategyParams {
  symbol: string;
  timeframe: string;
  from: string;
  to: string;
  tp: number;
  sl: number
  ema: number
  /** If provided, moves SL to entry once tpCoverage reaches this % (0-100). */
  breakevenTriggerPct?: number;
}

export interface RawCandle {
  v: number,
  vw: number,
  o: number,
  c: number,
  h: number,
  l: number,
  /** Unix MILLISECONDS (Massive's native unit). */
  t: number,
  n: number,
}

export interface Candle {
  /** Unix MILLISECONDS. */
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
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

export interface StrategyCandle extends Candle {
  dayHigh: number
  dayLow: number
  ema: number
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

export interface Operation {
  currentlyOpen: boolean;
  completed: boolean;
  entry: OperationEntry
  tp?: number;
  sl?: number;
  direction: Direction;
  outcome?: OperationOutcome;

  /**
   * Running most-favorable price reached while the op was open.
   *
   *   bullish — highest high seen
   *   bearish — lowest low seen
   *
   * Seeded to entryPrice when the op opens, then updated bar-by-bar by
   * `trackExtremes`. Undefined for pending ops (armed but not yet entered).
   */
  bestPrice?: number;

  /**
   * Running most-adverse price reached while the op was open.
   *
   *   bullish — lowest low seen
   *   bearish — highest high seen
   *
   * Drives the `slCoverage` metric on the emitted record: how much of the
   * SL budget a winner consumed before recovering to TP. Undefined for
   * pending ops.
   */
  worstPrice?: number;

  /** The original SL level at open time. Never changes, used for metrics. */
  originalSl?: number;

  /** True once the price reaches the breakeven trigger and SL moves to entry. */
  slMovedToBreakeven?: boolean;
}

export interface OperationEntry {
  /** Unix MILLISECONDS. */
  entryTime: number;
  /** Unix MILLISECONDS. */
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
  /** Unix MILLISECONDS. */
  entryTime: number;
  exitPrice: number;
  /** Unix MILLISECONDS. */
  exitTime: number;
  outcome?: OperationOutcome;
  pnlPct: number;
  entryName?: EntryName;

  /** Absolute TP level captured at open time. */
  tpPrice?: number;
  /** Absolute SL level captured at open time. */
  slPrice?: number;
  /** Best excursion while open (highest high for bullish, lowest low for bearish). */
  bestPrice?: number;
  /** Worst excursion while open (lowest low for bullish, highest high for bearish). */
  worstPrice?: number;

  /**
 * NOTE: the paragraph below describes the pre-absolute-percentage
 * version. Current code computes this for EVERY outcome and uses
 * entryPrice as the denominator (see the updated description below).
 *
 * ── Original ──
 * For TP-hit ops only: distance between the worst point the price
 * reached and the SL level, as % of entry price.
 *
 * Positive = the SL was never touched, and this is how much room was
 * left. Smaller = closer call. Small values across many winners mean
 * the SL is barely wide enough for the strategy's typical pullback.
 *
 * Undefined for SL hits, dayEnd closes, and any op missing the
 * excursion data.
 *
 * ── Current ──
 * Absolute adverse excursion as a % of entry price, computed for
 * EVERY closed op regardless of outcome.
 *
 * For a long:  (entryPrice - worstPrice) / entryPrice * 100
 * For a short: (worstPrice - entryPrice) / entryPrice * 100
 *
 * Non-negative. 0 = never moved against entry. Reads directly as
 * "% move against entry" (e.g. 1.0 = dipped 1% below entry on a long).
 * Undefined only when `worstPrice` is missing (pending ops that never
 * opened).
 */
  slCoverage?: number;

  /**
   * NOTE: the paragraph below describes the pre-absolute-percentage
   * version. Current code computes this for EVERY outcome and uses
   * entryPrice as the denominator (see the updated description below).
   *
   * ── Original ──
   * For SL-hit ops only: best favorable excursion as a fraction of the TP
   * distance, as a percentage. 0% = never moved toward TP; approaches 100%
   * = nearly won before reversing to SL.
   *
   * ── Current ──
   * Absolute favorable excursion as a % of entry price, computed for
   * EVERY closed op regardless of outcome.
   *
   * For a long:  (bestPrice - entryPrice) / entryPrice * 100
   * For a short: (entryPrice - bestPrice) / entryPrice * 100
   *
   * Non-negative. 0 = never moved toward TP. Reads directly as
   * "% move in favor" (e.g. 0.8 = ran 0.8% above entry on a long).
   * Undefined only when `bestPrice` is missing (pending ops that never
   * opened).
   */
  tpCoverage?: number;
}

export interface StrategyResult {
  candles: StrategyCandle[]
  records: OperationRecord[];
  stats?: OperationStats;
}

export interface EmaResult {
  value: number;
  newDay: boolean;
}

export interface Gap {
  /** Unix MILLISECONDS — left edge of the rectangle. */
  startTime: number;
  /** Unix MILLISECONDS — right edge of the rectangle. */
  endTime: number;
  topPrice: number;
  bottomPrice: number;
  direction: Direction
}

export interface OperationStats {
  total: number;
  tp: number;
  sl: number;
  /** Trades that hit the breakeven trigger and then stopped out at entry. */
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

export interface EntryLevel {
  price: number
  lineName?: "blue" | "orange"
}

export interface OperationClose {
  outcome: "tp" | "sl";
  exitPrice: number;
}