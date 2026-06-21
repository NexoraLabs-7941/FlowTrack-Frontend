/**
 * Value Objects for notification data based on notification types.
 * @remarks
 * This file defines the specific value objects for different notification types.
 */

/**
 * Value Object for expiring product notifications.
 */
export class ExpiringProductData {
  constructor(
    public readonly product: string,
    public readonly date: string // ISO date string (YYYY-MM-DD)
  ) {
    if (!product || product.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }
    if (!date || !this.isValidDate(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
  }

  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Gets the formatted date for display.
   * @returns The formatted date string.
   */
  getFormattedDate(): string {
    const date = new Date(this.date);
    return date.toLocaleDateString();
  }

  /**
   * Checks if the product is expiring soon (within 7 days).
   * @returns True if expiring soon, false otherwise.
   */
  isExpiringSoon(): boolean {
    const today = new Date();
    const expiringDate = new Date(this.date);
    const diffTime = expiringDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }
}

/**
 * Value Object for low stock notifications.
 */
export class LowStockData {
  constructor(
    public readonly product: string,
    public readonly quantity: number
  ) {
    if (!product || product.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
  }

  /**
   * Checks if the stock is critically low (less than 5 units).
   * @returns True if critically low, false otherwise.
   */
  isCriticallyLow(): boolean {
    return this.quantity < 5;
  }

  /**
   * Gets the stock status message.
   * @returns The stock status message.
   */
  getStockStatus(): string {
    if (this.isCriticallyLow()) {
      return 'Critically low stock';
    }
    return 'Low stock';
  }
}

/**
 * Value Object for general info notifications.
 */
export class InfoNotificationData {
  constructor(
    public readonly message: string,
    public readonly additionalData: Record<string, string | number | boolean> = {}
  ) {
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }
  }

  /**
   * Gets the full message with additional data.
   * @returns The complete message.
   */
  getFullMessage(): string {
    const additionalInfo = Object.entries(this.additionalData)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    return additionalInfo ? `${this.message} (${additionalInfo})` : this.message;
  }
}

/**
 * Union type for all possible notification data value objects.
 */
export type NotificationData = ExpiringProductData | LowStockData | InfoNotificationData;
