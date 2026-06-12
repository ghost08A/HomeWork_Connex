import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoadingComponent } from './Module/Shared/components/global-loading/global-loading.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class App {
  protected readonly title = signal('ClientApp');
}
