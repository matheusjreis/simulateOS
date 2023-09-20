import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from 'src/app/shared/shared.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PickScalingTypeDialogComponent } from './components/pick-scaling-type-dialog/pick-scaling-type-dialog.component';
import { ProcessesStatsComponent } from './components/processes-stats/processes-stats.component';
import { ShellRoutingModule } from './shell-routing.module';
import { ShellComponent } from './shell.component';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		ShellRoutingModule,
		MatButtonModule,
		MatSliderModule,
		FormsModule,
		MatDialogModule,
		ReactiveFormsModule,
		MatSelectModule,
		MatFormFieldModule,
		MatInputModule,
	],
	declarations: [
		ShellComponent,
		NavbarComponent,
		ProcessesStatsComponent,
		PickScalingTypeDialogComponent,
	],
})
export class ShellModule {}
