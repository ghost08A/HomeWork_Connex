import { Component, Input, OnChanges, SimpleChanges,inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationModel } from '../../models/navigation.model';
import { AuthService } from '../../../../Module/Authentication/service/auth.service';
import { CustomButtonComponent } from '../../../../Module/Shared/components/custom-button/custom-button.component';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CustomButtonComponent,RouterLink,RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnChanges{
  
  @Input() menuItems: NavigationModel[] = [];
 
  public sortedMenuItems: any[] = [];
  public isMobileMenuOpen: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  public toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    console.log('Mobile menu toggled:', this.isMobileMenuOpen);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menuItems'] && this.menuItems) {
      this.sortedMenuItems = [...this.menuItems].sort((a, b) => a.seq - b.seq);
    }
  }
  // get sortedMenuItems(): NavigationModel[] {
  //   console.log(this.a++);
  //   return [...this.menuItems].sort((a, b) => a.seq - b.seq);
  // }

  public onLogout(): void {
    console.log('Logout initiated');
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);

        this.router.navigate(['/auth/login']);
      }
    })
  }
}
