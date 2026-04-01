import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerWorksComponent } from './customer-works.component';

describe('CustomerWorksComponent', () => {
  let component: CustomerWorksComponent;
  let fixture: ComponentFixture<CustomerWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerWorksComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
