import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Package, BarChart3 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#F97316', '#0891B2', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function Analytics() {
  const { history, products, categories } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const analytics = useMemo(() => {
    const filteredHistory = history.filter((entry) => {
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
      return entryDate === selectedDate;
    });

    // Product sales
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filteredHistory.forEach((entry) => {
      entry.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    // Category sales
    const categorySales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filteredHistory.forEach((entry) => {
      entry.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          const category = categories.find((c) => c.id === product.categoryId);
          if (category) {
            if (!categorySales[category.id]) {
              categorySales[category.id] = {
                name: category.name,
                quantity: 0,
                revenue: 0,
              };
            }
            categorySales[category.id].quantity += item.quantity;
            categorySales[category.id].revenue += item.price * item.quantity;
          }
        }
      });
    });

    const productData = Object.values(productSales).sort((a, b) => b.quantity - a.quantity);
    const categoryData = Object.values(categorySales).sort((a, b) => b.revenue - a.revenue);

    // Non-selling products
    const soldProductIds = new Set(Object.keys(productSales));
    const nonSellingProducts = products.filter((p) => !soldProductIds.has(p.id));

    const totalRevenue = filteredHistory.reduce((sum, entry) => sum + entry.total, 0);
    const totalOrders = filteredHistory.length;
    const totalItems = filteredHistory.reduce(
      (sum, entry) => sum + entry.items.reduce((s, item) => s + item.quantity, 0),
      0
    );

    return {
      productData,
      categoryData,
      nonSellingProducts,
      totalRevenue,
      totalOrders,
      totalItems,
    };
  }, [history, selectedDate, products, categories]);

  const maxRevenue = Math.max(...analytics.categoryData.map((c) => c.revenue), 1);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Sales Analytics</h1>
        <p className="text-muted-foreground mt-1">Track product and category performance</p>
      </div>

      <div className="mb-6">
        <Label>Select Date</Label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full md:w-auto mt-2"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-primary">₹{analytics.totalRevenue}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-3xl font-bold text-primary">{analytics.totalOrders}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Items Sold</p>
              <p className="text-3xl font-bold text-primary">{analytics.totalItems}</p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
          {analytics.productData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.productData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#F97316" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">No sales data for this date</p>
          )}
        </Card>

        {/* Category Revenue Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue by Category</h2>
          {analytics.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">No sales data for this date</p>
          )}
        </Card>
      </div>

      {/* Category Performance */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Category Performance</h2>
        <div className="space-y-4">
          {analytics.categoryData.map((category, index) => {
            const percentage = (category.revenue / maxRevenue) * 100;
            return (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-muted-foreground">
                    ₹{category.revenue} ({category.quantity} items)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
          {analytics.categoryData.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No category data available</p>
          )}
        </div>
      </Card>

      {/* Non-Selling Products */}
      {analytics.nonSellingProducts.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-semibold">Non-Selling Products</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.nonSellingProducts.map((product) => {
              const category = categories.find((c) => c.id === product.categoryId);
              return (
                <div key={product.id} className="p-4 border border-border rounded-lg">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{category?.name}</p>
                  <p className="text-sm text-muted-foreground">₹{product.price}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
