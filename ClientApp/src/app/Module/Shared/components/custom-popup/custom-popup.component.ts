import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,   // ดึง ng-template ที่หน้าบ้านใส่เข้ามาข้างใน tag
  TemplateRef,    // type ของ ng-template
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxPopupModule } from 'devextreme-angular';

@Component({
  selector: 'custom-popup',
  imports: [],
  templateUrl: './custom-popup.component.html',
  styleUrl: './custom-popup.component.scss',
})
export class CustomPopupComponent {}
