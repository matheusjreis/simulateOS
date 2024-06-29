import { NgModule } from '@angular/core';
import { HomeRoutingModule } from './home-routing.module';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {MatCardModule} from '@angular/material/card'; 
import { HomeComponent } from './home.component';
import { MatToolbarModule } from  '@angular/material/toolbar';
import {MatButtonModule} from  '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav'
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [CommonModule, HomeRoutingModule, MatTableModule, MatFormFieldModule, MatSliderModule, FormsModule, MatInputModule, MatCardModule, MatButtonModule, MatToolbarModule,MatIconModule,  MatSnackBarModule, MatSidenavModule, MatButtonModule],
  declarations: [HomeComponent],
})
export class HomeModule {}