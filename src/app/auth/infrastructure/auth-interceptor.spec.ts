import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { authInterceptor } from './auth-interceptor';
import { JwtTokenService } from './jwt-token';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  let mockTokenService: jasmine.SpyObj<JwtTokenService>;
  let mockNext: jasmine.Spy;

  beforeEach(() => {
    mockTokenService = jasmine.createSpyObj('JwtTokenService', ['getToken', 'isTokenExpired']);
    mockNext = jasmine.createSpy('next');

    TestBed.configureTestingModule({
      providers: [
        { provide: JwtTokenService, useValue: mockTokenService }
      ]
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should skip adding token for login requests', () => {
    const req = new HttpRequest('POST', 'https://api.example.com/login');
    
    interceptor(req, mockNext);
    
    expect(mockNext).toHaveBeenCalledWith(req);
  });

  it('should skip adding token for register requests', () => {
    const req = new HttpRequest('POST', 'https://api.example.com/register');
    
    interceptor(req, mockNext);
    
    expect(mockNext).toHaveBeenCalledWith(req);
  });

  it('should add token to request when token is valid', () => {
    mockTokenService.getToken.and.returnValue('valid-token');
    mockTokenService.isTokenExpired.and.returnValue(false);
    
    const req = new HttpRequest('GET', 'https://api.example.com/data');
    interceptor(req, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
    const modifiedReq = mockNext.calls.mostRecent().args[0];
    expect(modifiedReq.headers.get('Authorization')).toBe('Bearer valid-token');
  });

  it('should not add token when token is expired', () => {
    mockTokenService.getToken.and.returnValue('expired-token');
    mockTokenService.isTokenExpired.and.returnValue(true);
    
    const req = new HttpRequest('GET', 'https://api.example.com/data');
    interceptor(req, mockNext);
    
    expect(mockNext).toHaveBeenCalledWith(req);
  });
});
