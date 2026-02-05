import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersOrderComponent } from './customers-order.component';

describe('CustomersOrderComponent', () => {
  let component: CustomersOrderComponent;
  let fixture: ComponentFixture<CustomersOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
