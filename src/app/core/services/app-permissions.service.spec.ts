import { TestBed } from '@angular/core/testing';

import { AppPermissionsService } from './app-permissions.service';

describe('AppPermissionsService', () => {
  let service: AppPermissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppPermissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
