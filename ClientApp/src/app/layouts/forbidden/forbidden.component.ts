import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'forbidden',
  imports: [],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.scss',
})
export class ForbiddenComponent {
    constructor(private router: Router) {}

  public goHome(): void {
    this.router.navigate(['/home']);
  }
}
