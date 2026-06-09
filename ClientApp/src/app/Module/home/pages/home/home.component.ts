import { Component, inject } from '@angular/core';
import { AuthService } from '../../../Authentication/service/auth.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent  {

  public authService = inject(AuthService);
}
