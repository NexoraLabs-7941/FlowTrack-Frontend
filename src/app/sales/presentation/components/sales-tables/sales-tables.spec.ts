import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTables } from './sales-tables';

describe('SalesTables', () => {
  let component: SalesTables;
  let fixture: ComponentFixture<SalesTables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesTables]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesTables);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
