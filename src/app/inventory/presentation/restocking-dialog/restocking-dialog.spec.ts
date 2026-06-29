import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestockingDialogComponent } from './restocking-dialog';
import { MatDialogRef } from '@angular/material/dialog';

describe('RestockingDialogComponent', () => {
  let component: RestockingDialogComponent;
  let fixture: ComponentFixture<RestockingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestockingDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RestockingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
