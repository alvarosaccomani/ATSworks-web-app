import { TestBed } from '@angular/core/testing';

import { RolPermissionsService } from './rol-permissions.service';

describe('RolPermissionsService', () => {
  let service: RolPermissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolPermissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
