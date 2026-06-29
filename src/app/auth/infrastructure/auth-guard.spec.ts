import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { authGuard } from './auth-guard';
import { JwtTokenService } from './jwt-token';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let mockTokenService: jasmine.SpyObj<JwtTokenService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockTokenService = jasmine.createSpyObj('JwtTokenService', ['hasToken', 'isTokenExpired']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: JwtTokenService, useValue: mockTokenService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when user is authenticated', () => {
    mockTokenService.hasToken.and.returnValue(true);
    mockTokenService.isTokenExpired.and.returnValue(false);
    
    const result = executeGuard({} as any, { url: '/dashboard' } as any);
    
    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockTokenService.hasToken.and.returnValue(false);
    
    const result = executeGuard({} as any, { url: '/dashboard' } as any);
    
    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], { queryParams: { returnUrl: '/dashboard' } });
  });

  it('should redirect to login when token is expired', () => {
    mockTokenService.hasToken.and.returnValue(true);
    mockTokenService.isTokenExpired.and.returnValue(true);
    
    const result = executeGuard({} as any, { url: '/dashboard' } as any);
    
    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], { queryParams: { returnUrl: '/dashboard' } });
  });
});
