import { TestBed } from '@angular/core/testing';

import { MemoryGameLogicService } from './memory-game-logic.service';

describe('MemoryGameLogicService', () => {
  let service: MemoryGameLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemoryGameLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
