import { Component, OnInit,inject ,signal} from '@angular/core';
import { Router } from '@angular/router';
import { NavigationModel } from '../../models/navigation.model';
import { AuthService } from '../../../../Module/Authentication/service/auth.service';
import { CustomButtonComponent } from '../../../../Module/Shared/components/custom-button/custom-button.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PostLoginService } from '../../services/post-login.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-navbar',
  imports: [CustomButtonComponent,RouterLink,RouterLinkActive,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit{
  
 
  public sortedMenuItems$: Observable<NavigationModel[]> | null = null;  public isMobileMenuOpen: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private postLoginService = inject(PostLoginService);
 ngOnInit(): void {
    this.sortedMenuItems$ = this.postLoginService.getNavbar();
    };
  

   public toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    console.log('Mobile menu toggled:', this.isMobileMenuOpen);
  }


  public onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
