import { db } from "../../database/mysql.js";

export const adminService = {
  /**
   * Get main platform statistics for the dashboard.
   */
  async getDashboardStats() {
    // 1. Calculate Total Revenue from paid/delivered orders
    const salesAggregate = await db.query(
      `SELECT SUM(total_amount) as total_revenue, COUNT(id) as total_orders
       FROM ec_orders
       WHERE status IN ('PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED') AND deleted_at IS NULL`
    );

    const totalRevenue = Number(salesAggregate?.total_revenue || 0);
    const totalOrders = Number(salesAggregate?.total_orders || 0);

    // 2. Total active users
    const totalUsers = await db.count("users", "isActive = true AND deleted_at IS NULL");

    // 3. Products low on stock (less than 10 units)
    const lowStockProducts = await db.selectAll(
      "products",
      "id, name, sku, stock_count",
      "stock_count < 10 AND deleted_at IS NULL",
      [],
      "ORDER BY stock_count ASC LIMIT 5"
    );

    // Format lowStock bigint ids
    const formattedLowStock = lowStockProducts.map((p) => ({
      id: Number(p.id),
      name: p.name,
      sku: p.sku,
      stockCount: p.stock_count,
    }));

    // 4. Top selling products
    const topSelling = await db.queryAll(
      `SELECT oi.product_id, p.name, p.sku, SUM(oi.quantity) as total_quantity, SUM(oi.line_total) as total_revenue
       FROM ec_order_items oi
       JOIN ec_products p ON oi.product_id = p.id
       GROUP BY oi.product_id, p.name, p.sku
       ORDER BY total_quantity DESC
       LIMIT 5`
    );

    const topSellingDetails = topSelling.map((item) => ({
      productId: Number(item.product_id),
      name: item.name || "Unknown Product",
      sku: item.sku || "",
      totalQuantitySold: Number(item.total_quantity || 0),
      totalRevenueGenerated: Number(item.total_revenue || 0),
    }));

    // 5. Recent 5 orders
    const recentOrdersRaw = await db.queryAll(
      `SELECT o.*, u.fullName, u.email
       FROM ec_orders o
       JOIN ec_users u ON o.user_id = u.id
       WHERE o.deleted_at IS NULL
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: Number(o.id),
      orderNumber: o.order_number,
      customerName: o.fullName,
      customerEmail: o.email,
      totalAmount: Number(o.total_amount),
      status: o.status,
      createdAt: o.created_at,
    }));

    // 6. Monthly Revenue (last 6 months)
    const monthlySalesRaw = await db.queryAll(
      `SELECT 
         DATE_FORMAT(created_at, '%Y-%m') as month,
         SUM(total_amount) as revenue,
         COUNT(id) as orderCount
       FROM ec_orders
       WHERE status IN ('PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED') 
         AND deleted_at IS NULL
         AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );

    const monthlySales = monthlySalesRaw.map((m) => ({
      month: String(m.month),
      revenue: Number(m.revenue || 0),
      orderCount: Number(m.orderCount || 0),
    }));

    return {
      revenue: totalRevenue,
      ordersCount: totalOrders,
      usersCount: totalUsers,
      lowStockProducts: formattedLowStock,
      topSellingProducts: topSellingDetails,
      recentOrders,
      monthlySales,
    };
  },
};
