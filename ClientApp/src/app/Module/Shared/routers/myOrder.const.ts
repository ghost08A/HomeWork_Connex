export class MyOrderRoute {
    static prefix = 'my-order';
    
    static orderDashboard = 'order-dashboard';
    static orderDashboardFullPath = `${MyOrderRoute.prefix}/${MyOrderRoute.orderDashboard}`;


    static orderDetail = 'order-detail';
    static orderDetailFullPath = `${MyOrderRoute.prefix}/${MyOrderRoute.orderDetail}`;
}
