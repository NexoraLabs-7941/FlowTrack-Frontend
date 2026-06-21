import { Injectable, signal, computed } from '@angular/core';
import { Provider } from '../../inventory/domain/model/provider.entity';
import { ProvidersApi } from '../infrastructure/providers-api';

/**
 * Store for managing provider state and operations.
 * @remarks
 * This service orchestrates provider use cases and manages provider state.
 */
@Injectable({
  providedIn: 'root'
})
export class ProvidersStore {
  private readonly providersSignal = signal<Provider[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly providers = this.providersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly hasProviders = computed(() => this.providers().length > 0);

  constructor(private providersApi: ProvidersApi) {
    this.loadProviders();
  }

  /**
   * Loads all providers from the API.
   */
  loadProviders(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.providersApi.getProviders().subscribe({
      next: (data: Provider[]) => {
        this.providersSignal.set(data);
        this.loadingSignal.set(false);
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error loading providers'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Adds a new provider to the store.
   * @param provider - The provider to add.
   */
  addProvider(provider: Provider): void {
    this.providersSignal.update(providers => [...providers, provider]);
  }

  /**
   * Updates an existing provider in the store.
   * @param updatedProvider - The updated provider.
   */
  updateProvider(updatedProvider: Provider): void {
    this.providersSignal.update(providers =>
      providers.map(p => (p.id === updatedProvider.id ? updatedProvider : p))
    );
  }

  /**
   * Removes a provider from the store.
   * @param providerId - The ID of the provider to remove.
   */
  removeProvider(providerId: string): void {
    this.providersSignal.update(providers =>
      providers.filter(p => p.id !== providerId)
    );
  }

  /**
   * Refreshes provider data.
   */
  refresh(): void {
    this.loadProviders();
  }

  /**
   * Formats error messages for better user experience.
   * @param error - The error object.
   * @param fallback - The fallback message if error is not an Error instance.
   * @returns A formatted error message.
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }
}
