import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersToolbar } from './providers-toolbar';

describe('ProvidersToolbar', () => {
  let component: ProvidersToolbar;
  let fixture: ComponentFixture<ProvidersToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvidersToolbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvidersToolbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
