import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewProductDialog } from './new-product-dialog';

describe('NewProductDialog', () => {
  let component: NewProductDialog;
  let fixture: ComponentFixture<NewProductDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewProductDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewProductDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
