import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserCredentials } from 'src/app/interfaces/auth';
import { UserService } from 'src/app/shared/services/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';

// import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit {
  ngOnInit(): void {
  }
}
