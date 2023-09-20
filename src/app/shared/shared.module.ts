import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { IconComponent } from './components/icon/icon.component';
import { ScalingTypeDescriptionPipe } from './pipes/scaling-type-description.pipe';

@NgModule({
	imports: [CommonModule, MatIconModule],
	declarations: [IconComponent, ScalingTypeDescriptionPipe],
	exports: [IconComponent, ScalingTypeDescriptionPipe],
})
export class SharedModule {}
