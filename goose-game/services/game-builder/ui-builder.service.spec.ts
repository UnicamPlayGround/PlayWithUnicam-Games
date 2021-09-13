import { TestBed } from '@angular/core/testing';

import { UiBuilderService } from './ui-builder.service';

describe('UiBuilderService', () => {
  let service: UiBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
