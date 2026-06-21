/**
 * Represents monthly income data for charts.
 * @remarks
 * This class encapsulates monthly income information for visualization.
 */
export class MonthlyIncome {
  /**
   * Creates a new MonthlyIncome instance.
   * @param data - An object containing month and amount.
   * @returns A new instance of MonthlyIncome.
   */
  constructor(data: {
    month: string;
    amount: number;
  }) {
    this._month = data.month;
    this._amount = data.amount;
  }

  private _month: string;
  get month(): string {
    return this._month;
  }

  private _amount: number;
  get amount(): number {
    return this._amount;
  }
}

