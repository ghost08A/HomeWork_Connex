export class ProductRoute {
    static prefix = 'product';
    static productDashboard = 'product-dashboard';
    static productDashboardFullPath = `${ProductRoute.prefix}/${ProductRoute.productDashboard}`;

    static productCategory = 'product-category';
    static productCategoryFullPath = `${ProductRoute.prefix}/${ProductRoute.productCategory}`;
}