import { TestBed } from '@angular/core/testing';

import { ResourcesTypesService } from './resources-types.service';

describe('ResourcesTypesService', () => {
  let service: ResourcesTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourcesTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
