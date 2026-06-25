import { TestBed } from '@angular/core/testing';

import { WorksHistoryService } from './works-history.service';

describe('WorksHistoryService', () => {
  let service: WorksHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorksHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
