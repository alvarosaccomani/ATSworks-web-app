import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MassiveWorksComponent } from './massive-works.component';

describe('MassiveWorksComponent', () => {
  let component: MassiveWorksComponent;
  let fixture: ComponentFixture<MassiveWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MassiveWorksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MassiveWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
