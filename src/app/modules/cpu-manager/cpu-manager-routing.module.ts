import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CpuManagerComponent } from './cpu-manager.component';

const routes: Routes = [
  {
    path: '',
    component: CpuManagerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CpuManagerRoutingModule {}
