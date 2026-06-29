import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { noAuthGuard } from './no-auth-guard';
import { JwtTokenService } from './jwt-token';

describe('noAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => noAuthGuard(...guardParameters));

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

  it('should allow access when user is not authenticated', () => {
    mockTokenService.hasToken.and.returnValue(false);
    
    const result = executeGuard({} as any, {} as any);
    
    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when user is authenticated', () => {
    mockTokenService.hasToken.and.returnValue(true);
    mockTokenService.isTokenExpired.and.returnValue(false);
    
    const result = executeGuard({} as any, {} as any);
    
    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should allow access when token is expired', () => {
    mockTokenService.hasToken.and.returnValue(true);
    mockTokenService.isTokenExpired.and.returnValue(true);
    
    const result = executeGuard({} as any, {} as any);
    
    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
