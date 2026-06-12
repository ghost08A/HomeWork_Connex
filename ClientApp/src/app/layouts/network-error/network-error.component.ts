import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'network-error',
  imports: [],
  templateUrl: './network-error.component.html',
  styleUrl: './network-error.component.scss',
})
export class NetworkErrorComponent {
  constructor(private router: Router) {}

  public goHome(): void {
    // พากลับไปที่หน้าแรกสุด (ซึ่งระบบจะเช็คเองว่ามีสิทธิ์เข้าหน้าไหน)
    this.router.navigate(['/home']);
  }
}
