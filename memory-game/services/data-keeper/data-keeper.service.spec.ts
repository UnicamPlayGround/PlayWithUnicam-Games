import { TestBed } from '@angular/core/testing';

import { MemoryDataKeeperService } from './data-keeper.service';

describe('MemoryDataKeeperService', () => {
  let service: MemoryDataKeeperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemoryDataKeeperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
