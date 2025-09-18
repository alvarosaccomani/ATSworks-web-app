import { TestBed } from '@angular/core/testing';

import { WorksDetailsService } from './works-details.service';

describe('WorksDetailsService', () => {
  let service: WorksDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorksDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
