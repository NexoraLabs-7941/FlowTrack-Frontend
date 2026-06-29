import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthStore } from '../../../application/auth.store';
import { LoginCredentials } from '../../../domain/model/login-credentials';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';

/**
 * Login component for user authentication.
 * @remarks
 * This component provides a form for users to authenticate with email and password.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    TranslateModule,
    LanguageSwitcher
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected translate = inject(TranslateService);
  protected authStore = inject(AuthStore);

  protected loginForm = this.fb.group({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  protected t(key: string): string {
    return this.translate.instant(key);
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = new LoginCredentials({
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!
    });

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.authStore.login(credentials, returnUrl);
  }

  protected navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
