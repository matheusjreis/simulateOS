import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserCredentials } from 'src/app/interfaces/auth';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/interfaces/auth';

// import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit {
  userInformations: User | null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
    // private msgService: MessageService
  ) { 
    this.userInformations = null;
  }


  ngOnInit(): void {
    this.userService.getLoggedUser().subscribe(
      response => {
        if(response.success){
          this.showUserGreetings();
          this.userService.setUserDataOnLocalStorage(response.data!);

          if(!response.data)
            this.router.navigate(['login']);
        }
      },
      error => {
        this.router.navigate(['login']);
      }
    )
  }

  closeSession() {
    this.authService.closeSession().subscribe(
      response => {
        this.router.navigate(['login']);
      },
      error => {
        console.log(error.message);
        this.router.navigate(['login']);
      }
    )
  }

  showUserGreetings(){
    this.userService.getLoggedUser().subscribe(
      response => {
        if(response.success){
          this.userService.setUserDataOnLocalStorage(response.data!);
          this.userInformations = response.data;
        }
      },
      error => {
        this.router.navigate(['login']);
        // this.msgService.add({ severity: 'error', summary: 'Erro', detail: error.error.message });
      }
    )
  }





}
