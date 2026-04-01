import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapWorksComponent } from './map-works.component';

describe('MapWorksComponent', () => {
  let component: MapWorksComponent;
  let fixture: ComponentFixture<MapWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapWorksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
