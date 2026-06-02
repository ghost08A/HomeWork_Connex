import { Component, Input, Output,EventEmitter } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'app-custom-button',
  imports: [DxButtonModule],
  templateUrl: './custom-button.component.html',
  styleUrl: './custom-button.component.scss',
})
export class CustomButtonComponent {

  @Input() text: string = 'Button';
  @Input() type: 'normal'| 'default'  | 'success' | 'danger' = 'default'
  @Input() stylingMode: 'text' | 'outlined' | 'contained' = 'contained';
  @Input() width: string | number = 'auto';
  @Input() icon: string = '';
  @Input() disabled: boolean = false;

  @Output() onClick = new EventEmitter<any>();

  handleClick(event: any) {
    this.onClick.emit(event);
  }
}
