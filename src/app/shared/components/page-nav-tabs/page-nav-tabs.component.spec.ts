import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNavTabsComponent } from './page-nav-tabs.component';

describe('PageNavTabsComponent', () => {
  let component: PageNavTabsComponent;
  let fixture: ComponentFixture<PageNavTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageNavTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageNavTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
