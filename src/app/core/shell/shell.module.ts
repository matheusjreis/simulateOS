import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShellComponent } from './shell.component';
import { ShellRoutingModule } from './shell-routing.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatButtonModule } from '@angular/material/button';
import { ProcessesStatsComponent } from './components/processes-stats/processes-stats.component';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@NgModule({
  imports: [CommonModule, ShellRoutingModule, MatButtonModule, MatSliderModule, FormsModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatOptionModule, MatSidenavModule],
  declarations: [ShellComponent, NavbarComponent, ProcessesStatsComponent],
})
export class ShellModule {}


// import { NgModule } from '@angular/core';
// import { HomeRoutingModule } from './home-routing.module';
// import { CommonModule } from '@angular/common';
// import { MatTableModule } from '@angular/material/table';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSliderModule } from '@angular/material/slider';
// import { FormsModule } from '@angular/forms';
// import { MatInputModule } from '@angular/material/input';
// import {MatCardModule} from '@angular/material/card'; 
// import { HomeComponent } from './home.component';
// import { MatToolbarModule } from  '@angular/material/toolbar';
// import {MatButtonModule} from  '@angular/material/button';
// import {MatSidenavModule} from '@angular/material/sidenav'
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatIconModule } from '@angular/material/icon';

// @NgModule({
//   imports: [CommonModule, HomeRoutingModule, MatTableModule, MatFormFieldModule, MatSliderModule, FormsModule, MatInputModule, MatCardModule, MatButtonModule, MatToolbarModule,MatIconModule,  MatSnackBarModule, MatSidenavModule, MatButtonModule],
//   declarations: [HomeComponent],
// })
// export class HomeModule {}