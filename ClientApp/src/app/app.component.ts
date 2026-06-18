import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoadingComponent } from './Module/Shared/components/global-loading/global-loading.component';
import { ConfirmDialogComponent } from './Module/Shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoadingComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class App {
  protected readonly title = signal('ClientApp');
}
