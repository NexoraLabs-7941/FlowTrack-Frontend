import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { roleGuard } from './role-guard';
import { JwtTokenService } from './jwt-token';

describe('roleGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => roleGuard(...guardParameters));

  let mockTokenService: jasmine.SpyObj<JwtTokenService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockTokenService = jasmine.createSpyObj('JwtTokenService', ['hasToken', 'isTokenExpired', 'decodeToken']);
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

  it('should allow access when user has required role', () => {
    mockTokenService.hasToken.and.returnValue(true);
    mockTokenService.isTokenExpired.and.returnValue(false);
    mockTokenService.decodeToken.and.returnValue({ role: 'Administrador' });
    
    const route = { data: { roles: ['Administrador'] } } as any;
    const result = executeGuard(route, { url: '/perfil' } as any);
    
    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockTokenService.hasToken.and.returnValue(false);
    
    const route = { data: { roles: ['Administrador'] } } as any;
    const result = executeGuard(route, { url: '/perfil' } as any);
    
    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], { queryParams: { returnUrl: '/perfil' } });
  });

  it('should redirect to unauthorized when user does not have required role', () => {
    mockTokenService.hasToken.and.returnValue(true);
    mockTokenService.isTokenExpired.and.returnValue(false);
    mockTokenService.decodeToken.and.returnValue({ role: 'Usuario' });
    
    const route = { data: { roles: ['Administrador'] } } as any;
    const result = executeGuard(route, { url: '/perfil' } as any);
    
    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });
});
