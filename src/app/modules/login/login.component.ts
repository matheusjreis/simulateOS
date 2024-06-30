import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserCredentials } from 'src/app/interfaces/auth';
import { UserService } from 'src/app/shared/services/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';

// import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  })

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
    // private msgService: MessageService
  ) { }

  get email() { return this.loginForm.controls['email']; }

  get password() { return this.loginForm.controls['password']; }

  loginUser() {
    const { email, password } = this.loginForm.value;
    
    const userCredentials = <UserCredentials>({
      userName: email,
      userPassword: password
   });

    this.authService.authenticateUser(userCredentials).subscribe(
      response => {
        this.snackBar.open('Não se esqueça de clicar em logout ao terminar a sessão!', 'OK');
        localStorage.setItem('userToken', response.data!);
        this.router.navigate(['home']);
      },
      error => {
        this.snackBar.open('Usuário não autorizado!', 'Fechar');
      }
    )
  }

  ngOnInit(): void {
   localStorage.clear();
  }
}
