/**
 * Represents the credentials required for user login.
 * @remarks
 * This class encapsulates the data needed for authentication.
 */
export class LoginCredentials {
  /**
   * Creates a new LoginCredentials instance.
   * @param credentials - An object containing email and password.
   * @returns A new instance of LoginCredentials.
   */
  constructor(credentials: {
    email: string;
    password: string;
  }) {
    this._email = credentials.email;
    this._password = credentials.password;
  }

  /**
   * The email address for login.
   */
  private _email: string;
  get email(): string {
    return this._email;
  }
  set email(value: string) {
    this._email = value;
  }

  /**
   * The password for login.
   */
  private _password: string;
  get password(): string {
    return this._password;
  }
  set password(value: string) {
    this._password = value;
  }
}
