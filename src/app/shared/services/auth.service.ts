import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, UserCredentials } from '../../interfaces/auth';
import { EduMetricsApiReponse } from '../../interfaces/response';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
  })
  export class AuthService {
  
    private baseUrl = 'https://localhost:7298';
  
    constructor(private http: HttpClient) { }  
  
    getUserByEmail(email: string) {
      return this.http.get<User>(`${this.baseUrl}/login/users?email=${email}`);
    }
  
    authenticateUser(userCredentials: UserCredentials){
      return this.http.post<EduMetricsApiReponse>(`${this.baseUrl}/login/authenticate`, userCredentials);
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
  