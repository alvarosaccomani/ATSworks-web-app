import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolPermissionComponent } from './rol-permission.component';

describe('RolPermissionComponent', () => {
  let component: RolPermissionComponent;
  let fixture: ComponentFixture<RolPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolPermissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
