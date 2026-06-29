import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { KitApi } from './kit-api';

describe('KitApi', () => {
  let service: KitApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [KitApi]
    });
    service = TestBed.inject(KitApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

