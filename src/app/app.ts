import {Component, inject, signal, effect} from '@angular/core';
import {Layout} from './shared/presentation/components/layout/layout';
import {TranslateService} from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';
import { FirebaseService } from './shared/infrastructure/firebase.service';
import { AuthStore } from './auth/application/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FlowTrack-frontend');
  private translate: TranslateService;
  private firebaseService: FirebaseService;
  private authStore = inject(AuthStore);

  constructor() {
    this.translate = inject(TranslateService);
    this.translate.addLangs(['en', 'es']);
    this.translate.use('en');
    
    // Inject FirebaseService to trigger early initialization
    this.firebaseService = inject(FirebaseService);

    // Watch auth status. If user is authenticated, sync their token under their user ID.
    // Otherwise sync under 'test-user' as a development fallback.
    effect(() => {
      const user = this.authStore.user();
      const userId = user && user.id ? user.id : 'test-user';
      console.log('Syncing FCM token for userId:', userId);
      this.firebaseService.requestPushNotificationToken().then(token => {
        if (token) {
          this.firebaseService.registerTokenWithBackend(userId, token)
            .then(() => console.log(`Successfully registered token with backend for user: ${userId}`))
            .catch(err => console.error(`Error syncing token with backend for user: ${userId}`, err));
        }
      });
    });
  }
}
