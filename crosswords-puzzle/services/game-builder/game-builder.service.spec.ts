import { TestBed } from '@angular/core/testing';

import { GameBuilderService } from './game-builder.service';

describe('GameBuilderService', () => {
  let service: GameBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
