import { NgModule } from '@angular/core';
import { UserRegistrationRoutingModule } from './user-registration-routing.module';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { UserRegistrationComponent } from './user-registration.component';
import {MatCardModule} from '@angular/material/card'; 
import { MatToolbarModule } from  '@angular/material/toolbar';
import {MatButtonModule} from  '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {  MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';



@NgModule({
  imports: [CommonModule, UserRegistrationRoutingModule,MatSelectModule, MatOptionModule, MatTableModule, MatFormFieldModule, MatSliderModule, FormsModule, MatInputModule, MatCardModule, MatButtonModule, MatToolbarModule, MatSnackBarModule],
  declarations: [UserRegistrationComponent],
})
export class UserRegistrationModule {}
