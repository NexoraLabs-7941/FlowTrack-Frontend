import { TestBed } from '@angular/core/testing';

import { JwtToken } from './jwt-token';

describe('JwtToken', () => {
  let service: JwtToken;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtToken);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
