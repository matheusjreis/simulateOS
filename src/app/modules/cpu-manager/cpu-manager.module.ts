import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpuManagerComponent } from './cpu-manager.component';
import { CpuManagerRoutingModule } from './cpu-manager-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [CommonModule, CpuManagerRoutingModule, MatTableModule, MatFormFieldModule, MatSliderModule, FormsModule, MatInputModule],
  declarations: [CpuManagerComponent],
})
export class CpuManagerModule {}
