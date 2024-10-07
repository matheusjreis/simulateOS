import { NgModule } from '@angular/core';
import { LoginRoutingModule } from './login-routing.module';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { LoginComponent } from './login.component';
import {MatCardModule} from '@angular/material/card'; 
import { MatToolbarModule } from  '@angular/material/toolbar';
import {MatButtonModule} from  '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';



@NgModule({
  imports: [CommonModule, LoginRoutingModule, MatTableModule, MatFormFieldModule, MatSliderModule, FormsModule, MatInputModule, MatCardModule, MatButtonModule, MatToolbarModule, MatSnackBarModule],
  declarations: [LoginComponent],
})

export class LoginModule {}