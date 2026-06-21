import { Component, inject } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: true,
  imports: [TranslateModule],
})
export class HomeComponent {
  private translate = inject(TranslateService);

  protected t(key: string): string {
    return this.translate.instant(key);
  }
}
