import { TestBed } from '@angular/core/testing';

import { InventoryStore } from './inventory.store';

describe('InventoryStore', () => {
  let service: InventoryStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
