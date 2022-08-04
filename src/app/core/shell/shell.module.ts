import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShellComponent } from './shell.component';
import { ShellRoutingModule } from './shell-routing.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatButtonModule } from '@angular/material/button';
import { ProcessesStatsComponent } from './components/processes-stats/processes-stats.component';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, ShellRoutingModule, MatButtonModule, MatSliderModule, FormsModule],
  declarations: [ShellComponent, NavbarComponent, ProcessesStatsComponent],
})
export class ShellModule {}
