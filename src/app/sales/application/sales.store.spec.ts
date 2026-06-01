import { TestBed } from '@angular/core/testing';

import { SalesStore } from './sales.store';

describe('SalesStore', () => {
  let service: SalesStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
