import { TestBed } from '@angular/core/testing';

import { ModelItemsService } from './model-items.service';

describe('ModelItemsService', () => {
  let service: ModelItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
