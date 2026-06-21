namespace HomeWork.Domain.Enums;

public class EnumOrderStatus
{
    public const string PENDING = "PENDING";
    public const string APPROVED = "APPROVED";
    public const string REJECTED = "REJECTED";
    public const string DRAFT = "DRAFT";
    public const string SUBMIT = "SUBMIT";
    public const string WAITAPPROVE = "WAITAPPROVE";
    public const string CANCELLED = "CANCELLED";
}

public class EnumOrderDetailStatus
{
    public const string APPROVED = "APPROVED";
    public const string REJECTED = "REJECTED";
    public const string RETURNED = "RETURNED";
    public const string PARTIALRETURN = "PARTIALRETURN";
}
