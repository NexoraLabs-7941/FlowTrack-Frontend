import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewKitDialogComponent } from './new-kit-dialog';

describe('NewKitDialogComponent', () => {
  let component: NewKitDialogComponent;
  let fixture: ComponentFixture<NewKitDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewKitDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewKitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
