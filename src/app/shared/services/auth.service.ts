import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, UserCredentials } from '../../interfaces/auth';
import { EduMetricsApiReponse } from '../../interfaces/response';
import { FormBuilder, Validators } from '@angular/forms';
import { UserIp } from 'src/app/interfaces/userIp';
import { UserService } from './user.service';
import { HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgModule } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })

  export class AuthService {
    loginForm = new FormBuilder().group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })

    private baseUrl = 'https://localhost:7298';
    snackBar: any;
    router: any;
  
    constructor(private http: HttpClient) { 
    }  
  
    getUserByEmail(email: string) {
      return this.http.get<User>(`${this.baseUrl}/login/users?email=${email}`);
    }
  
    authenticateUser(userCredentials: UserCredentials) : Boolean{
      new UserService(this.http).getUserIP().subscribe(
        response => {
          const userIp: UserIp = response;        
          const headers = new HttpHeaders({
            'computerIp': `${userIp.ip}`
          });
          
          const authenticateUser: Observable<EduMetricsApiReponse>  = this.http.post<EduMetricsApiReponse>(
            `${this.baseUrl}/login/authenticate`, userCredentials,
            { headers: headers }
          );
           
          authenticateUser.subscribe(
            response => {
              // this.snackBar.open('Não se esqueça de clicar em logout ao terminar a sessão!', 'OK');
              localStorage.setItem('userToken', response.data!);
              return response.success;
              // this.router.navigate(['home']);
            }
          )
          return true;
        }
      ); 
      return true; 
    }
  
    isSessionActivated(){
      const token = localStorage.getItem("userToken");
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      
      return this.http.post<EduMetricsApiReponse>(
        `${this.baseUrl}/session/is-user-session-activated`,
        null,
        { headers: headers }
      );
    }
  }
  