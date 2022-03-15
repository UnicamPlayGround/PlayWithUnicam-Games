import { TestBed } from '@angular/core/testing';

import { QuizLogicService } from './quiz-logic.service';

describe('QuizLogicService', () => {
  let service: QuizLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
