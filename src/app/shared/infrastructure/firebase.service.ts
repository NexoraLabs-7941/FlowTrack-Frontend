import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { DashboardStore } from '../../dashboard/application/dashboard.store';
import { DashboardNotification } from '../../dashboard/domain/model/notification.entity';
import { InfoNotificationData } from '../../dashboard/domain/model/notification-data';

/**
 * Service to initialize and manage Firebase inside the Angular application.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app!: FirebaseApp;
  private analytics!: Analytics;
  private messaging!: Messaging;
  private http = inject(HttpClient);
  private dashboardStore = inject(DashboardStore);

  constructor() {
    this.initializeFirebase();
  }

  /**
   * Initializes the Firebase App using credentials from the active environment.
   */
  private initializeFirebase() {
    try {
      if (environment.firebase) {
        console.log('Initializing Firebase App with custom configurations...');
        this.app = initializeApp(environment.firebase);
        
        // Analytics and Messaging require browser environment
        if (typeof window !== 'undefined') {
          this.analytics = getAnalytics(this.app);
          console.log('Firebase Analytics initialized.');
          
          try {
            this.messaging = getMessaging(this.app);
            console.log('Firebase Messaging initialized.');
            this.setupForegroundListener();
          } catch (msgError) {
            console.warn('Firebase Messaging not supported or failed to initialize:', msgError);
          }
        }
        console.log('Firebase App initialized successfully.');
      } else {
        console.warn('Firebase configuration missing in active environment.');
      }
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }

  /**
   * Request permission from user to receive Push Notifications and return the registration token.
   */
  async requestPushNotificationToken(): Promise<string | null> {
    try {
      if (typeof window === 'undefined' || !this.messaging) {
        console.warn('FCM token request skipped: not in browser or messaging client not initialized.');
        return null;
      }
      
      const config = environment.firebase as any;
      if (!config.vapidKey) {
        console.warn('VAPID key missing in Firebase environment configuration.');
        return null;
      }
      
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted. Fetching FCM token...');
        const token = await getToken(this.messaging, { vapidKey: config.vapidKey });
        console.log('FCM Registration Token:', token);
        return token;
      } else {
        console.warn('Notification permission denied.');
        return null;
      }
    } catch (error) {
      console.error('Failed to retrieve FCM token:', error);
      return null;
    }
  }

  /**
   * Syncs the FCM token to the backend server.
   */
  async registerTokenWithBackend(userId: string, token: string): Promise<any> {
    try {
      const url = `${environment.platformProviderApiBaseUrl}/notifications/register-token`;
      const payload = {
        userId: userId,
        token: token,
        deviceType: 'web'
      };
      console.log(`Sending token registration payload to backend: ${url}`);
      return await firstValueFrom(this.http.post(url, payload));
    } catch (error) {
      console.error('Failed to register FCM token with backend:', error);
      throw error;
    }
  }

  /**
   * Sets up a listener for messages received while the application is in the foreground.
   */
  private setupForegroundListener() {
    onMessage(this.messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      if (payload.notification) {
        const title = payload.notification.title || 'FlowTrack Alert';
        const body = payload.notification.body || '';
        
        // Trigger a native browser notification
        const options = {
          body: body,
          icon: '/assets/icons/icon-192x192.png'
        };
        new Notification(title, options);

        // Instantly add it to the dashboard store notifications array so the UI updates in real-time
        try {
          const dashboardNoti = new DashboardNotification({
            id: 'fcm-' + Date.now(),
            type: 'info',
            title: title,
            message: body,
            data: new InfoNotificationData(body)
          });
          this.dashboardStore.addNotification(dashboardNoti);
          console.log('Successfully pushed notification to local dashboard store');
        } catch (err) {
          console.warn('Could not add notification to dashboard store:', err);
        }
      }
    });
  }

  getFirebaseApp(): FirebaseApp {
    return this.app;
  }

  getAnalytics(): Analytics {
    return this.analytics;
  }
}
