import { TestBed } from '@angular/core/testing';

import { WorksAttachmentsService } from './works-attachments.service';

describe('WorksAttachmentsService', () => {
  let service: WorksAttachmentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorksAttachmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
