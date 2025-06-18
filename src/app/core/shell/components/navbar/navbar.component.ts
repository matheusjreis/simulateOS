import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }
}
