import { Injectable, signal } from '@angular/core';
import { ConfirmDialogConfig } from '../models/confirm-dialog.model';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  // state ทั้งหมดเก็บใน signal
  visible = signal(false);
  config = signal<ConfirmDialogConfig>({ message: '' });

  private resolveRef: ((value: boolean) => void) | null = null;

  // เรียกจาก component ใดก็ได้ → คืน Promise<boolean>
  confirm(config: ConfirmDialogConfig): Promise<boolean> {
    this.config.set(config);
    this.visible.set(true);

    return new Promise((resolve) => {
      this.resolveRef = resolve;
    });
  }

  // เรียกจาก confirm-dialog component เท่านั้น
  resolve(result: boolean): void {
    this.visible.set(false);
    this.resolveRef?.(result);
    this.resolveRef = null;
  }
}