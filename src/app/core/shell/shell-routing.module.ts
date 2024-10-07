import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShellComponent } from './shell.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'process-manager',
        pathMatch: 'full',
      },
      {
        path: 'process-manager',
        component: ShellComponent,
        loadChildren: () =>
          import('../../modules/process-manager/process-manager.module').then(
            (m) => m.ProcessManagerModule
          ),
      },
      {
        path: 'cpu-manager',
        component: ShellComponent,
        loadChildren: () =>
          import('../../modules/cpu-manager/cpu-manager.module').then(
            (m) => m.CpuManagerModule
          ),
      },
      {
        path: 'login',
        loadChildren: () =>
          import('../../modules/login/login.module').then(
            (m) => m.LoginModule
          ),
      },
      {
        path: 'home',
        loadChildren: () =>
          import('../../modules/home/home.module').then(
            (m) => m.HomeModule
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
