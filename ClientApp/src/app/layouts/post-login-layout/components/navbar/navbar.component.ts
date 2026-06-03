import { Component, Input } from '@angular/core';
import { NavigationModel } from '../../models/navigation.model';
import { AuthService } from '../../../../Module/Authentication/service/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CustomButtonComponent } from '../../../../Module/Shared/components/custom-button/custom-button.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink,RouterLinkActive,CustomButtonComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {

  @Input() menuItems : NavigationModel[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  get sortedMenuItems(): NavigationModel[] {
    return this.menuItems.sort((a, b) => a.seq - b.seq);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
