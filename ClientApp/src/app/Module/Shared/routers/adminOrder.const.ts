export class AdminOrderRoute {
    static prefix = 'admin-order';
    static orderDashboard = 'order-admin-dashboard';
    static orderDashboardFullPath = `${AdminOrderRoute.prefix}/${AdminOrderRoute.orderDashboard}`;

    static orderDetail = 'order-admin-detail';
    static orderDetailFullPath = `${AdminOrderRoute.prefix}/${AdminOrderRoute.orderDetail}`;
}