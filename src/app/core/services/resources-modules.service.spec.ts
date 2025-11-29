import { TestBed } from '@angular/core/testing';

import { ResourcesModulesService } from './resources-modules.service';

describe('ResourcesModulesService', () => {
  let service: ResourcesModulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourcesModulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
