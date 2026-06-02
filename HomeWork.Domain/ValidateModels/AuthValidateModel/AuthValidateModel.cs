using FluentValidation;
using HomeWork.Domain.RequestModels.AuthRequestModel;

namespace HomeWork.Domain.Validators
{
    public class LoginRequestValidator : AbstractValidator<LoginRequestModel>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("กรุณากรอก Username");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("กรุณากรอกรหัสผ่าน")
                .MinimumLength(4).WithMessage("รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร");
        }
    }

    public class RegisterRequesrValidator : AbstractValidator<RegisterRequestModel>
    {
        public RegisterRequesrValidator()
        {
            // ตรวจสอบ Username
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("กรุณากรอก username")
                .MaximumLength(200).WithMessage("ความยาวห้ามเกิน 200")
                .Must(NotContainEmoji).WithMessage("ห้ามใส่ emoji");
            // ตรวจสอบ FirstName
            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("กรุณากรอกชื่อจริง")
                .MaximumLength(200).WithMessage("ความยาวห้ามเกิน 200")
                .Must(NotContainEmoji).WithMessage("ห้ามใส่ emoji");

            // ตรวจสอบ LastName
            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("กรุณากรอกนามสกุล")
                .MaximumLength(200).WithMessage("ความยาวห้ามเกิน 200")
                .Must(NotContainEmoji).WithMessage("ห้ามใส่ emoji");

            // ตรวจสอบรหัสผ่านตรงกัน (โยง error ไปที่ฟิลด์ confirmPassword ให้ UI แดงถูกช่อง)
            RuleFor(x => x.ConfirmPassword)
                .Equal(x => x.Password).WithMessage("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน")
                .WithName("confirmpassword");

            //  ตรวจสอบเบอร์โทรศัพท์
            RuleFor(x => x.Phone)
                .Must(x => x?.Length <= 10 && x.All(char.IsDigit))
                .WithMessage("เบอร์โทรศัพท์ต้องเป็นตัวเลข และความยาวไม่เกิน 10 หลัก");

            //  ตรวจสอบอายุ
            RuleFor(x => x.Age)
                .Must(BeValidAgeNumber).WithMessage("รูปแบบอายุไม่ถูกต้อง")
                .DependentRules(() =>
                {
                    // เงื่อนไขนี้จะทำก็ต่อเมื่อผ่าน BeValidAgeNumber (เป็นตัวเลข) แล้วเท่านั้น
                    RuleFor(x => x.Age)
                        .Must(BeInRange).WithMessage("อายุต้องอยู่ระหว่าง 1 ถึง 100 ปี");
                });
        }
        private bool NotContainEmoji(string text)
        {
            if (string.IsNullOrEmpty(text)) return true;
            return !text.Any(char.IsSurrogate); // เช็ค Emoji
        }

        private bool BeValidAgeNumber(string ageStr)
        {
            return int.TryParse(ageStr, out _);
        }

        private bool BeInRange(string ageStr)
        {
            if (int.TryParse(ageStr, out int age))
            {
                return age >= 1 && age <= 100;
            }
            return false;
        }
    }
}