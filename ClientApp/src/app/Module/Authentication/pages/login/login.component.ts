import { Component } from '@angular/core';
import notify from 'devextreme/ui/notify';
import { LoginRequestModel } from '../../models/authentication.model';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router'; // 1. นำเข้า Router ของ Angular
import { CustomInputComponent } from '../../../Shared/components/custom-input/custom-input.component';
import { ErrorEditorState } from '../../../Shared/directives/validate-error.directive';
import { CustomButtonComponent } from "../../../Shared/components/custom-button/custom-button.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [  CustomInputComponent, CustomButtonComponent], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // ถ้ามีไฟล์ SCSS
})
export class LoginComponent {
  // เข้าถึง dx-validation-group จาก HTML

  // ผูกข้อมูลกับ Model ที่เราสร้างไว้
  public formData = new LoginRequestModel();

  public loginState = new ErrorEditorState();

  constructor(private authService: AuthService, private router: Router) {}

  onFieldValueChange(fieldName: keyof LoginRequestModel, value: any): void {
    this.formData[fieldName] = value ?? '';
    this.loginState.clearError(fieldName);
  }

  public onLoginClick(): void {
    this.loginState.clearAllError();
    let isValid = true;
    

    if (!this.formData.username) {
      this.loginState.setError('username', 'กรุณากรอก Username');
      isValid = false;

    }
    if (!this.formData.password) {
      this.loginState.setError('password', 'กรุณากรอก Password');
      isValid = false;
    }
    if (isValid) {
      notify({ message: 'กำลังเข้าสู่ระบบ...', type: 'info', displayTime: 2000 });
      this.authService.login(this.formData, this.loginState).subscribe((res) => {
    
          notify({ message: 'เข้าสู่ระบบสำเร็จ!', type: 'success', displayTime: 3000 });
          this.router.navigate(['/home']);
        
      });
    } else {
      notify({ message: 'กรุณากรอก Username และ Password ให้ครบถ้วน', type: 'error', displayTime: 3000 });
    }
  }

  public onRegisterClick(): void {
    this.router.navigate(['auth/register']);
  }
}
