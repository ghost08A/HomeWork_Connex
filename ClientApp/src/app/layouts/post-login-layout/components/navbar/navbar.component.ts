import { Component, OnInit, ChangeDetectorRef,inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationModel } from '../../models/navigation.model';
import { AuthService } from '../../../../Module/Authentication/service/auth.service';
import { CustomButtonComponent } from '../../../../Module/Shared/components/custom-button/custom-button.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PostLoginService } from '../../services/post-login.service';
@Component({
  selector: 'app-navbar',
  imports: [CustomButtonComponent,RouterLink,RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit{
  
 
  public sortedMenuItems: NavigationModel[] = [];
  public isMobileMenuOpen: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private postLoginService = inject(PostLoginService);
  private cdr = inject(ChangeDetectorRef);
 ngOnInit(): void {
    // 🌟 ดึงข้อมูล API ทันทีที่ Navbar โหลดขึ้นมา
    this.postLoginService.getNavbar().subscribe({
      next: (data) => {
        // ได้ข้อมูลปุ๊บ จับเรียงลำดับ (Sort) แล้วยัดใส่ตัวแปรที่ใช้วาดหน้าจอเลย
        this.sortedMenuItems = [...data].sort((a, b) => a.seq - b.seq);

        // บอก Angular ว่าข้อมูลเปลี่ยนแปลงแล้ว ให้รีเฟรชหน้าจอด้วย
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('ดึงข้อมูลเมนูไม่สำเร็จ:', err);
      }
    });
  }

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
