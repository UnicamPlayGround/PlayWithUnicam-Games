import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemoryMenuPage } from './menu.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/memory/dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MemoryMenuPage,
    children: [
      { path: 'dashboard', loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardPageModule) },
      { path: 'players', loadChildren: () => import('../players/players.module').then(m => m.PlayersPageModule) },
      { path: 'game', loadChildren: () => import('../../gameSingleMode/game.module').then(m => m.GamePageModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemoryMenuPageRoutingModule { }
