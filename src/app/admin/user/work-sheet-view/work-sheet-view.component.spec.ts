import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkSheetViewComponent } from './work-sheet-view.component';

describe('WorkSheetViewComponent', () => {
  let component: WorkSheetViewComponent;
  let fixture: ComponentFixture<WorkSheetViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkSheetViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkSheetViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
