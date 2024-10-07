import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../interfaces/auth';
import { EduMetricsApiReponse } from '../../interfaces/response';
import { HttpHeaders } from '@angular/common/http';
import { UserIp } from 'src/app/interfaces/userIp';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'https://localhost:7298/user-register';

  constructor(private http: HttpClient) { }  
  
  getLoggedUser() {
    const token = localStorage.getItem("userToken");
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<EduMetricsApiReponse>(
      `${this.baseUrl}/logged`,
      { headers: headers }
    );
  }

  registerUser(userDetails: User) {
    return this.http.post(`${this.baseUrl}`, userDetails);
  }

  setUserDataOnLocalStorage(userDetails: User){
    localStorage.setItem("userInformations", JSON.stringify(userDetails));
  }

  cleanUserDataOnLocalStorage(){
    localStorage.removeItem("userInformations");
  }

  getUserIP(){   
    return this.http.get(
      `https://api.ipify.org/?format=json`,
    );
  }

  getUserInformationOnLocalStorage(){
    let cachedUser: string | null = localStorage.getItem("userInformations");

    if(cachedUser != null){
      let userInformations: User = JSON.parse(cachedUser);

      return userInformations;
    } else {
      return null;
    }
  }
}


