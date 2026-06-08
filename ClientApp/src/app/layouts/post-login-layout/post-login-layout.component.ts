import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../Module/Authentication/service/auth.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NavigationModel } from './models/navigation.model';
import { PostLoginService } from './services/post-login.service';

@Component({
  selector: 'app-post-login-layout',
  imports: [RouterOutlet,NavbarComponent],
  templateUrl: './post-login-layout.component.html',
  styleUrl: './post-login-layout.component.scss',
})
export class PostLoginLayoutComponent {}
