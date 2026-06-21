import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersTable } from './providers-table';

describe('ProvidersTable', () => {
  let component: ProvidersTable;
  let fixture: ComponentFixture<ProvidersTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvidersTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvidersTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
