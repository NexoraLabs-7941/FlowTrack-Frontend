/**
 * Represents the data required for user registration.
 * @remarks
 * This class encapsulates all information needed to create a new user account.
 */
export class RegisterData {
  /**
   * Creates a new RegisterData instance.
   * @param data - An object containing registration information.
   * @returns A new instance of RegisterData.
   */
  constructor(data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    this._email = data.email;
    this._password = data.password;
    this._confirmPassword = data.confirmPassword;
  }

  /**
   * The email address for the new account.
   */
  private _email: string;
  get email(): string {
    return this._email;
  }
  set email(value: string) {
    this._email = value;
  }

  /**
   * The password for the new account.
   */
  private _password: string;
  get password(): string {
    return this._password;
  }
  set password(value: string) {
    this._password = value;
  }

  /**
   * The password confirmation (used for frontend validation only).
   */
  private _confirmPassword: string;
  get confirmPassword(): string {
    return this._confirmPassword;
  }
  set confirmPassword(value: string) {
    this._confirmPassword = value;
  }


  /**
   * Validates that passwords match.
   * @returns True if password and confirmPassword are equal.
   */
  passwordsMatch(): boolean {
    return this._password === this._confirmPassword;
  }
}
