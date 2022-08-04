import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShellComponent } from './shell.component';

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'process-manager',
        pathMatch: 'full',
      },
      {
        path: 'process-manager',
        loadChildren: () =>
          import('../../modules/process-manager/process-manager.module').then(
            (m) => m.ProcessManagerModule
          ),
      },
      {
        path: 'cpu-manager',
        loadChildren: () =>
          import('../../modules/cpu-manager/cpu-manager.module').then(
            (m) => m.CpuManagerModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShellRoutingModule {}
