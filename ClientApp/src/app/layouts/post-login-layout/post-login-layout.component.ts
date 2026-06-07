import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../Module/Authentication/service/auth.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NavigationModel } from './models/navigation.model';
import { HomeComponent } from '../../Module/home/pages/home/home.component';

@Component({
  selector: 'app-post-login-layout',
  imports: [RouterOutlet,NavbarComponent,HomeComponent],
  templateUrl: './post-login-layout.component.html',
  styleUrl: './post-login-layout.component.scss',
})
export class PostLoginLayoutComponent {

  constructor(private authService: AuthService,private router: Router) {}
  public navbarData: NavigationModel[] = [];

  ngOnInit(): void {
    // 2. 🚀 จำลองสถานการณ์เมื่อหลังบ้านส่งข้อมูลเมนูชุดนี้กลับมาให้เรา (สลับลำดับกันมาเลย)
    this.navbarData = [
      { pageName: 'จัดการออเดอร์', pageUrl: '/order', seq: 2 },
      { pageName: 'หน้ารายงานผล', pageUrl: '/report', seq: 3 },
      { pageName: 'หน้าหลัก', pageUrl: '/home', seq: 1 }, // ตัวนี้ seq=1 ต้องถูกดึงขึ้นมาอันแรกสุด
    ];
  }
  

 
}
