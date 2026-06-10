import { Component ,ChangeDetectorRef} from '@angular/core';
import { RegisterModel } from '../../models/authentication.model';
import { ErrorEditorState } from '../../../Shared/directives/validate-error.directive';
import { Router } from  '@angular/router';
import notify from 'devextreme/ui/notify';
import { AuthService } from '../../service/auth.service';
import { CustomButtonComponent } from '../../../Shared/components/custom-button/custom-button.component';
import { CustomInputComponent } from '../../../Shared/components/custom-input/custom-input.component';


@Component({
  selector: 'app-register',
  imports: [ CustomInputComponent, CustomButtonComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {

  formData: RegisterModel = new RegisterModel();
  // 2. สร้างกล่องจัดการ Error ประจำหน้า Register
  public registerState = new ErrorEditorState();

  constructor(private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  public onRegisterSubmit(): void{
    this.registerState.clearAllError();
    let isValid = true;

    if (!this.formData.username?.trim()) {
      this.registerState.setError('username', 'กรุณาระบุ Username');
      isValid = false;
    }
    if (!this.formData.password) {
      this.registerState.setError('password', 'กรุณาระบุ Password');
      isValid = false;
    }
    if (!this.formData.confirmPassword) {
      this.registerState.setError('confirmPassword', 'กรุณายืนยัน Password อีกครั้ง');
      isValid = false;
    }
    if(this.formData.password !== this.formData.confirmPassword) {
      this.registerState.setError('confirmPassword', 'รหัสผ่านไม่ตรงกัน');
      isValid = false;
    }
    if (!this.formData.firstName?.trim()) {
      this.registerState.setError('firstname', 'กรุณาระบุชื่อจริง');
      isValid = false;
    }
    if (!this.formData.lastName?.trim()) {
      this.registerState.setError('lastname', 'กรุณาระบุนามสกุล');
      isValid = false;
    }
    if(!this.formData.age || this.formData.age <= 0) {
      if(this.formData.age>100 || this.formData.age < 0) {
        this.registerState.setError('age', 'กรุณาระบุอายุที่ถูกต้อง');
        isValid = false;
      }else {
        this.registerState.setError('age', 'กรุณาระบุอายุ');
        isValid = false;
      }
    }
    if (!this.formData.phone?.trim()) {
      this.registerState.setError('phone', 'กรุณาระบุเบอร์โทรศัพท์');
      isValid = false;
    }
    if(isValid) {
      notify({ message: 'กำลังลงทะเบียน...', type: 'info', displayTime: 2000 });
      console.log('ข้อมูลที่ส่งไปยัง Backend:', this.formData);
      this.authService.register(this.formData, this.registerState)
      .subscribe({
        next: (response) => {
          console.log('ข้อมูลที่ Backend ตอบกลับมา:', response);
          notify({ message: 'ลงทะเบียนสำเร็จ!', type: 'success', displayTime: 3000 });
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 1000);
        },
        error: () => {
          this.cdr.detectChanges(); 
        }
      });
    }
  }
  public onBackToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
