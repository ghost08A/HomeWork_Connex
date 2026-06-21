export enum orderDetailStatus {
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    RETURNED = 'RETURNED',
    PARTIALRETURN = 'PARTIALRETURN',
}

export enum orderStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    DRAFT  = 'DRAFT',
    SUBMIT = 'SUBMIT',
    WAITAPPROVE = 'WAITAPPROVE',
    CANCELLED = 'CANCELLED',
}

export const orderDetailStatusLabel: Record<orderDetailStatus, string> = {
    [orderDetailStatus.APPROVED]: 'Approved',
    [orderDetailStatus.REJECTED]: 'Rejected',
    [orderDetailStatus.RETURNED]: 'Returned',
    [orderDetailStatus.PARTIALRETURN]: 'Partial Return',
};

export const orderStatusLabel: Record<orderStatus, string> = {
    [orderStatus.PENDING]: 'Pending',
    [orderStatus.APPROVED]: 'Approved',
    [orderStatus.REJECTED]: 'Rejected',
    [orderStatus.DRAFT]: 'Draft',
    [orderStatus.SUBMIT]: 'Submit',
    [orderStatus.WAITAPPROVE]: 'Wait Approve',
    [orderStatus.CANCELLED]: 'Cancelled',
};
