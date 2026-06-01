import { TestBed } from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import { ProvidersApi } from './providers-api';
import { HttpClient } from '@angular/common/http';

describe('ProvidersApi', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [provideHttpClientTesting()]
    });
    httpClient = TestBed.inject(HttpClient);
  });

  it('should create an instance', () => {
    expect(new ProvidersApi(httpClient)).toBeTruthy();
  });
});
