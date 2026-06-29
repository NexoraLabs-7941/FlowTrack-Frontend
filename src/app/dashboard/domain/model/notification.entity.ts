import { NotificationData } from './notification-data';

/**
 * Represents a notification in the dashboard.
 * @remarks
 * This class encapsulates notification information for the dashboard.
 */
export class DashboardNotification {
  /**
   * Creates a new DashboardNotification instance.
   * @param data - An object containing notification data.
   * @returns A new instance of DashboardNotification.
   */
  constructor(data: {
    id: string;
    type: 'warning' | 'alert' | 'info';
    title: string;
    message: string;
    data?: NotificationData;
  }) {
    this._id = data.id;
    this._type = data.type;
    this._title = data.title;
    this._message = data.message;
    this._data = data.data || { message: '' } as NotificationData;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _type: 'warning' | 'alert' | 'info';
  get type(): 'warning' | 'alert' | 'info' {
    return this._type;
  }

  private _title: string;
  get title(): string {
    return this._title;
  }

  private _message: string;
  get message(): string {
    return this._message;
  }

  private _data: NotificationData;
  get data(): NotificationData {
    return this._data;
  }
}

