import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsItemsComponent } from './models-items.component';

describe('ModelsItemsComponent', () => {
  let component: ModelsItemsComponent;
  let fixture: ComponentFixture<ModelsItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelsItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelsItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
