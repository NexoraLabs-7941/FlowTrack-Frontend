import { TestBed } from '@angular/core/testing';

import { ProvidersStore } from './providers.store';

describe('ProvidersStore', () => {
  let service: ProvidersStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProvidersStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
