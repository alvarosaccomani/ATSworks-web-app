import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolPermissionsComponent } from './rol-permissions.component';

describe('RolPermissionsComponent', () => {
  let component: RolPermissionsComponent;
  let fixture: ComponentFixture<RolPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolPermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
