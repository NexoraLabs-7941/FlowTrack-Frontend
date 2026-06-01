import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Represents a Provider entity in the application.
 * Holds basic contact info and tax id (RUC).
 */
export class Provider implements BaseEntity {
  /**
   * Creates a new Provider instance.
   * @param provider - An object containing id, firstName, lastName, phoneNumber, email and ruc.
   * @returns A new instance of Provider.
   */
  constructor(provider: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    ruc: string;
  }) {
    this._id = provider.id;
    this._firstName = provider.firstName;
    this._lastName = provider.lastName;
    this._phoneNumber = provider.phoneNumber;
    this._email = provider.email;
    this._ruc = provider.ruc;
  }

  /** The unique identifier for the provider. */
  private _id: string;
  get id(): string { return this._id; }
  set id(value: string) { this._id = value; }

  /** First name */
  private _firstName: string;
  get firstName(): string { return this._firstName; }
  set firstName(value: string) { this._firstName = value; }

  /** Last name */
  private _lastName: string;
  get lastName(): string { return this._lastName; }
  set lastName(value: string) { this._lastName = value; }

  /** Phone number (kept as string) */
  private _phoneNumber: string;
  get phoneNumber(): string { return this._phoneNumber; }
  set phoneNumber(value: string) { this._phoneNumber = value; }

  /** Email */
  private _email: string;
  get email(): string { return this._email; }
  set email(value: string) { this._email = value; }

  /** Peruvian tax id (RUC) */
  private _ruc: string;
  get ruc(): string { return this._ruc; }
  set ruc(value: string) { this._ruc = value; }
}
