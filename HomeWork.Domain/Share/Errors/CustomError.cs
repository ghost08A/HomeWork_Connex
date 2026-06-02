using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.Share.Errors
{
    public class CustomError : Exception, IDisposable
    {
        public List<string> ErrorMessage { get; set; } = new List<string>();
        public Dictionary<string, List<ErrorMessage>> ErrorList { get; set; } = new Dictionary<string, List<ErrorMessage>>();

        public CustomError() { }

        public CustomError(string message) : base(message)
        {
            ErrorMessage.Add(message);
        }

        public CustomError(string message, Exception innerException) : base(message, innerException)
        {
            ErrorMessage.Add(message);
        }

        public CustomError(string message, string key) : base(message)
        {
            if (!ErrorList.ContainsKey(key))
            {
                ErrorList[key] = new List<ErrorMessage>();
            }
            ErrorList[key].Add(new ErrorMessage { Message = message });
        }

        public CustomError(Exception ex) : base(ex.Message, ex)  // ✅ เก็บ exception ต้นฉบับ
        {
            ErrorMessage.Add(ex.Message);
        }

        public void ThrowIfError()
        {
            if (ErrorMessage.Count > 0 || (ErrorList.Count > 0 && ErrorList.Values.Any(v => v.Count > 0)))
            {
                throw this; // ✅ จะยังคง stack trace ของ exception ต้นฉบับไว้
            }
        }

        public void Dispose()
        {
            ThrowIfError();
        }

        public void AddError(string message)
        {
            message = message.StartsWith("- ") ? message.Substring(2) : message;
            ErrorMessage.Add($"- {message}");
        }

        public void AddError(string key, string message)
        {
            if (!ErrorList.ContainsKey(key))
            {
                ErrorList[key] = new List<ErrorMessage>();
            }
            message = message.StartsWith("- ") ? message.Substring(2) : message;
            ErrorList[key].Add(new ErrorMessage { Message = $"- {message}" });
        }

        public void AddErrorKeyAndToast(string key, string message)
        {
            message = message.StartsWith("- ") ? message.Substring(2) : message;

            AddError(key, message);
            AddError($"- {message}");
        }

        public void AddErrorKeyAndToast(List<string> key, string message)
        {
            foreach (var item in key)
            {
                AddError(item, message);
            }
            AddError($"- {message}");
        }
    }

    public class ErrorMessage
    {
        public string Message { get; set; }
    }
}
