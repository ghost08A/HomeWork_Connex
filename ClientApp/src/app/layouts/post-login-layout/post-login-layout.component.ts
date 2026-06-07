import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../Module/Authentication/service/auth.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NavigationModel } from './models/navigation.model';

@Component({
  selector: 'app-post-login-layout',
  imports: [RouterOutlet,NavbarComponent],
  templateUrl: './post-login-layout.component.html',
  styleUrl: './post-login-layout.component.scss',
})
export class PostLoginLayoutComponent {

  constructor(private authService: AuthService,private router: Router) {}
  public navbarData: NavigationModel[] = [];

  ngOnInit(): void {
    this.navbarData = [
      { pageName: 'ออเดอร์', pageUrl: '/order', seq: 2 },
      { pageName: 'รายการผู้ใช้งาน', pageUrl: '/report', seq: 3 },
      { pageName: 'จัดการออเดอร์', pageUrl: '/home', seq: 4 },
      { pageName: 'จัดการออเดอร์', pageUrl: '/home', seq: 1 }, // ตัวนี้ seq=1 ต้องถูกดึงขึ้นมาอันแรกสุด
    ];
  }
  

 
}
