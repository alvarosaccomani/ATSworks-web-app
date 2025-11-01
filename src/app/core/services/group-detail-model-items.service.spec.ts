import { TestBed } from '@angular/core/testing';

import { GroupDetailModelItemsService } from './group-detail-model-items.service';

describe('GroupDetailModelItemsService', () => {
  let service: GroupDetailModelItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupDetailModelItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
