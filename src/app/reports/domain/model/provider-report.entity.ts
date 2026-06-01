import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Represents a Provider Report entity.
 * @remarks
 * This class contains provider information for reports.
 */
export class ProviderReport implements BaseEntity {
  constructor(provider: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    ruc: string;
    productCount?: number;
    productNames?: string[];
    categoryNames?: string[];
  }) {
    this._id = provider.id;
    this._firstName = provider.firstName;
    this._lastName = provider.lastName;
    this._phoneNumber = provider.phoneNumber;
    this._email = provider.email;
    this._ruc = provider.ruc;
    this._productCount = provider.productCount ?? 0;
    this._productNames = provider.productNames ?? [];
    this._categoryNames = provider.categoryNames ?? [];
  }

  private _id: string;
  get id(): string { return this._id; }
  set id(value: string) { this._id = value; }

  private _firstName: string;
  get firstName(): string { return this._firstName; }
  set firstName(value: string) { this._firstName = value; }

  private _lastName: string;
  get lastName(): string { return this._lastName; }
  set lastName(value: string) { this._lastName = value; }

  private _phoneNumber: string;
  get phoneNumber(): string { return this._phoneNumber; }
  set phoneNumber(value: string) { this._phoneNumber = value; }

  private _email: string;
  get email(): string { return this._email; }
  set email(value: string) { this._email = value; }

  private _ruc: string;
  get ruc(): string { return this._ruc; }
  set ruc(value: string) { this._ruc = value; }

  private _productCount: number;
  get productCount(): number { return this._productCount; }
  set productCount(value: number) { this._productCount = value; }

  private _productNames: string[];
  get productNames(): string[] { return this._productNames; }
  set productNames(value: string[]) { this._productNames = value; }

  private _categoryNames: string[];
  get categoryNames(): string[] { return this._categoryNames; }
  set categoryNames(value: string[]) { this._categoryNames = value; }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get productsDisplay(): string {
    if (this._productNames.length === 0) {
      return '-';
    }
    return this._productNames.join(', ');
  }
}

