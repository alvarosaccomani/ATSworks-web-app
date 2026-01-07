import { TestBed } from '@angular/core/testing';

import { WorkStatesService } from './work-states.service';

describe('WorkStatesService', () => {
  let service: WorkStatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkStatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
