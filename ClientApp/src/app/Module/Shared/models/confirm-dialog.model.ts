export interface ConfirmDialogConfig {
  title?: string;
  message: string;
  confirmText?: string;       // default: 'ยืนยัน'
  cancelText?: string;        // default: 'ยกเลิก'
  confirmType?: 'default' | 'danger' | 'success';  // สีปุ่มยืนยัน
  icon?: 'warning' | 'delete' | 'save' | 'info';
}