import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PickScalingTypeDialogComponent } from './components/pick-scaling-type-dialog/pick-scaling-type-dialog.component';
import { ProcessesStatsComponent } from './components/processes-stats/processes-stats.component';
import { ShellRoutingModule } from './shell-routing.module';
import { ShellComponent } from './shell.component';

@NgModule({
	imports: [
		CommonModule,
		ShellRoutingModule,
		MatButtonModule,
		MatSliderModule,
		FormsModule,
		MatDialogModule,
		ReactiveFormsModule,
		MatSelectModule,
		MatFormFieldModule,
	],
	declarations: [
		ShellComponent,
		NavbarComponent,
		ProcessesStatsComponent,
		PickScalingTypeDialogComponent,
	],
})
export class ShellModule {}
