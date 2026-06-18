import { Component , inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomPopupComponent } from '../custom-popup/custom-popup.component';
import { PopupButton } from '../../models/typecustom.model';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'confirm-dialog',
   standalone: true,
  imports: [CommonModule,CustomPopupComponent],
 template: `
    <custom-popup
      [(visible)]="visible"
      [title]="config().title ?? 'ยืนยันการดำเนินการ'"
      [width]="420"
      [height]="'auto'"
      [showCloseButton]="false"
      [closeOnOutsideClick]="false"
        [contentTemplate]="content"
      [buttons]="buttons()"
    >
      <ng-template #content>
        <div class="confirm-body">
          <!-- Icon -->
          @if (config().icon) {
            <div class="confirm-icon" [ngClass]="'icon-' + config().icon">
              <i [class]="iconClass()"></i>
            </div>
          }
          <!-- Message -->
          <p class="confirm-message">{{ config().message }}</p>
        </div>
      </ng-template>
    </custom-popup>
  `,
  styles: [`
    .confirm-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 8px 0 4px;
      text-align: center;
    }
    .confirm-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    .icon-warning  { background: #FEF3C7; color: #D97706; }
    .icon-delete   { background: #FEE2E2; color: #DC2626; }
    .icon-save     { background: #D1FAE5; color: #059669; }
    .icon-info     { background: #DBEAFE; color: #2563EB; }
    .confirm-message {
      font-size: 15px;
      color: #374151;
      margin: 0;
      line-height: 1.6;
      white-space: pre-line;
    }
  `]
})
export class ConfirmDialogComponent {
  private svc = inject(ConfirmDialogService);

  // อ่านค่า signal จาก service โดยตรง
  get visible() { return this.svc.visible(); }
  set visible(v: boolean) { if (!v) this.svc.resolve(false); }

  config = this.svc.config;

  iconClass = computed(() => {
    const map: Record<string, string> = {
      warning: 'dx-icon dx-icon-warning',
      delete:  'dx-icon dx-icon-trash',
      save:    'dx-icon dx-icon-save',
      info:    'dx-icon dx-icon-info',
    };
    return map[this.config().icon ?? ''] ?? '';
  });

  buttons = computed<PopupButton[]>(() => {
    const cfg = this.config();
    const confirmType = cfg.confirmType ?? 'default';

    // map type → DevExtreme button type
    const typeMap: Record<string, string> = {
      default: 'default',
      danger:  'danger',
      success: 'success',
    };

    return [
      {
        text: cfg.cancelText ?? 'ยกเลิก',
        type: 'normal' as any,
        stylingMode: 'outlined',
        onClick: () => this.svc.resolve(false),
      },
      {
        text: cfg.confirmText ?? 'ยืนยัน',
        type: typeMap[confirmType] as any,
        stylingMode: 'contained',
        onClick: () => this.svc.resolve(true),
      },
    ];
  });
}
