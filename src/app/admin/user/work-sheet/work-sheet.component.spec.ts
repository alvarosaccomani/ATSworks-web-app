import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkSheetComponent } from './work-sheet.component';

describe('WorkSheetComponent', () => {
  let component: WorkSheetComponent;
  let fixture: ComponentFixture<WorkSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
