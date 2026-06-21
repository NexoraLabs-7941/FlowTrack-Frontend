import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductInfoDialog } from './product-info-dialog';

describe('ProductInfoDialog', () => {
  let component: ProductInfoDialog;
  let fixture: ComponentFixture<ProductInfoDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductInfoDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductInfoDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
