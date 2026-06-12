using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace HomeWork.Service.Helper
{
    public class CommonHelper
    {
        public static string ComputeSHA512(string s)
        {
            StringBuilder sb = new StringBuilder();
            using (SHA512 sha512 = SHA512.Create())
            {
                byte[] hashValue = sha512.ComputeHash(Encoding.UTF8.GetBytes(s));
                foreach (byte b in hashValue)
                {
                    sb.Append($"{b:X2}");
                }
            }

            return sb.ToString();
        }

        public static bool ContainsEmoji(string text)
        {
            if (string.IsNullOrEmpty(text)) return false;
            // เช็คว่ามีอักขระที่เป็น Surrogate (Emoji) ปะปนมาหรือไม่
            return text.Any(char.IsSurrogate);
        }
    }
}
