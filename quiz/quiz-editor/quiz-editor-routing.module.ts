import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuizEditorPage } from './quiz-editor.page';

const routes: Routes = [
  {
    path: '',
    component: QuizEditorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuizEditorPageRoutingModule {}
