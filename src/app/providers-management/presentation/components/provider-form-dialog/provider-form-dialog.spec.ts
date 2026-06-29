import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderFormDialog } from './provider-form-dialog';

describe('ProviderFormDialog', () => {
  let component: ProviderFormDialog;
  let fixture: ComponentFixture<ProviderFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
