import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar';
import { MobileNavComponent } from '../mobile-nav/mobile-nav';
import { TopbarComponent } from '../topbar/topbar';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    SidebarComponent,
    MobileNavComponent,
    TopbarComponent,
    CommonModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit, OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();
  isMobile = false;

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
