import { TestBed } from '@angular/core/testing';

import { CollectionFormsService } from './collection-forms.service';

describe('CollectionFormsService', () => {
  let service: CollectionFormsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollectionFormsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
