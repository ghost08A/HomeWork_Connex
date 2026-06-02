import { Component ,ChangeDetectorRef} from '@angular/core';
import { registerModel } from '../../models/authentication.model';
import { ErrorEditorState } from '../../../Shared/directives/validate-error.directive';
import { Router } from  '@angular/router';
import notify from 'devextreme/ui/notify';
import { AuthService } from '../../service/auth.service';
import { CustomButtonComponent } from '../../../Shared/components/custom-button/custom-button.component';
import { CustomInputComponent } from '../../../Shared/components/custom-input/custom-input.component';
import { DxValidationGroupComponent,DxValidatorModule,} from 'devextreme-angular';


@Component({
  selector: 'app-register',
  imports: [DxValidationGroupComponent, DxValidatorModule, CustomInputComponent, CustomButtonComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {

  formData: registerModel = {
    Username: '',
    Password: '',
    ConfirmPassword: '',
    FirstName: '',
    LastName: '',
    Age: 0,
    Phone: '',
    BirthDate: null
  };
  // 2. สร้างกล่องจัดการ Error ประจำหน้า Register
  public registerState = new ErrorEditorState();

  constructor(private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  onRegisterSubmit(e: any): void{
    //ล้างข้อความเตือนเก่าออกก่อนเริ่มตรวจใหม่

    this.registerState.clearAllError();
    let isValid = true;

    // --- ตรวจสอบข้อมูลฟิลด์ที่จำเป็น (Validation) ---
    if (!this.formData.Username?.trim()) {
      this.registerState.setError('username', 'กรุณาระบุ Username');
      isValid = false;
    }

    if (!this.formData.Password) {
      this.registerState.setError('password', 'กรุณาระบุ Password');
      isValid = false;
    }

    if (!this.formData.ConfirmPassword) {
      this.registerState.setError('confirmPassword', 'กรุณายืนยัน Password อีกครั้ง');
      isValid = false;
    }

    if(this.formData.Password !== this.formData.ConfirmPassword) {
      this.registerState.setError('confirmPassword', 'รหัสผ่านไม่ตรงกัน');
      isValid = false;
    }

    if (!this.formData.FirstName?.trim()) {
      this.registerState.setError('firstname', 'กรุณาระบุชื่อจริง');
      isValid = false;
    }

    if (!this.formData.LastName?.trim()) {
      this.registerState.setError('lastname', 'กรุณาระบุนามสกุล');
      isValid = false;
    }

    if(!this.formData.Age || this.formData.Age <= 0) {
      if(this.formData.Age>100 || this.formData.Age < 0) {
        this.registerState.setError('age', 'กรุณาระบุอายุที่ถูกต้อง');
        isValid = false;
      }else {
        this.registerState.setError('age', 'กรุณาระบุอายุ');
        isValid = false;
      }
    }

    if (!this.formData.Phone?.trim()) {
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
           if (response.token && response) {
            localStorage.clear(); // ล้างข้อมูลเก่าออกก่อนเก็บข้อมูลใหม่
            localStorage.setItem('token', response.token);
          }
          notify({ message: 'ลงทะเบียนสำเร็จ!', type: 'success', displayTime: 3000 });

          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 1000);
        },
        error: () => {
          // สั่งให้ Angular รีเฟรชหน้าจอและอัปเดต UI (รวมถึงช่อง Input) ทันที!
          this.cdr.detectChanges(); 
        }
      });
    }
   


  }
  onBackToLogin(e: any): void {
    this.router.navigate(['/auth/login']);
  }
}
