import { TestBed } from '@angular/core/testing';

import { DetailModelItemsService } from './detail-model-items.service';

describe('DetailModelItemsService', () => {
  let service: DetailModelItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailModelItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
