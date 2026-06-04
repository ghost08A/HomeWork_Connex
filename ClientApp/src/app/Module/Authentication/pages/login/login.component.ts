import { Component, ViewChild } from '@angular/core';
import { DxValidationGroupComponent,DxValidatorModule,} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { loginModel } from '../../models/authentication.model';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router'; // 1. นำเข้า Router ของ Angular
import { CustomInputComponent } from '../../../Shared/components/custom-input/custom-input.component';
import { ErrorEditorState } from '../../../Shared/directives/validate-error.directive';
import { CustomButtonComponent } from "../../../Shared/components/custom-button/custom-button.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DxValidationGroupComponent, DxValidatorModule, CustomInputComponent, CustomButtonComponent], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // ถ้ามีไฟล์ SCSS
})
export class LoginComponent {
  // เข้าถึง dx-validation-group จาก HTML
  @ViewChild('loginGroup', { static: false }) validationGroup!: DxValidationGroupComponent;

  // ผูกข้อมูลกับ Model ที่เราสร้างไว้
  formData: loginModel = {
  Username: '',
  Password: ''
  };

  public loginState = new ErrorEditorState();

  constructor(private authService: AuthService, private router: Router) {}

  onFieldValueChange(fieldName: keyof loginModel, value: any): void {
    this.formData[fieldName] = value ?? '';
    this.loginState.clearError(fieldName);
  }

  onLoginClick(e: any): void {
    this.loginState.clearAllError();
    let isValid = true;
    

    if (!this.formData.Username) {
      this.loginState.setError('Username', 'กรุณากรอก Username');
      isValid = false;

    }
    if (!this.formData.Password) {
      this.loginState.setError('Password', 'กรุณากรอก Password');
      isValid = false;
    }
    if (isValid) {
      // แจ้งเตือนผู้ใช้ว่ากำลังประมวลผล
      notify({ message: 'กำลังเข้าสู่ระบบ...', type: 'info', displayTime: 2000 });

      // 3. สั่งให้บุรุษไปรษณีย์ส่งข้อมูล และใช้ .subscribe() เพื่อ "รอเปิดกล่อง" รับคำตอบจาก Backend
      this.authService.login(this.formData).subscribe({
        
        // กรณีที่ 1: Backend ตอบกลับมาว่า "สำเร็จ" (HTTP Status 200)
        next: (response) => {
          console.log('ข้อมูลที่ Backend ตอบกลับมา:', response);
          notify({ message: 'เข้าสู่ระบบสำเร็จ!', type: 'success', displayTime: 3000 });
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        },

        // กรณีที่ 2: Backend ตอบกลับมาว่า "มีข้อผิดพลาด" (เช่น รหัสผิด, เซิร์ฟเวอร์พัง 400, 401, 500)
        error: (err) => {
         
          console.error('เข้าสู่ระบบไม่สำเร็จ:', err);

           var errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
          if (err.error && err.error.Errors && err.error.Errors.length > 0) {
          // 2. ดึงค่า String ใน Array มาได้เลย ไม่ต้องใส่ .message 
            errorMessage = err.error.Errors[0]; 
          } 
          // 3. เปลี่ยนเป็น Message (ตัว M ใหญ่) ตามที่ API ส่งมา
          else if (err.error && err.error.Message) {
            errorMessage = err.error.Message;
          }
           notify({ message: `เข้าสู่ระบบไม่สำเร็จ: ${errorMessage}`, type: 'error', displayTime: 3000 });
        }
      });
    } else {
      notify({ message: 'กรุณากรอก Username และ Password ให้ครบถ้วน', type: 'error', displayTime: 3000 });
    }
  }

  onRegisterClick(e: any): void {
    this.router.navigate(['auth/register']);
  }
}
