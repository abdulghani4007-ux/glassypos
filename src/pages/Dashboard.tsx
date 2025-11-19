import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Package, AlertTriangle, Receipt, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { getSettings, getSales, getMedicines, getRefunds } from "@/lib/storage";
import { useMemo } from "react";

const Dashboard = () => {
  const settings = getSettings();
  const sales = getSales();
  const medicines = getMedicines();
  const refunds = getRefunds();
  
  // Calculate real-time stats
  const stats = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    
    // Calculate profit from medicines cost vs sale price
    const totalProfit = sales.reduce((sum, sale) => {
      const saleProfit = sale.items.reduce((itemSum, item) => {
        const medicine = medicines.find(m => m.id === item.medicineId);
        if (medicine) {
          return itemSum + ((item.price - medicine.costPrice) * item.quantity);
        }
        return itemSum;
      }, 0);
      return sum + saleProfit;
    }, 0);
    
    const stockItems = medicines.length;
    const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);
    
    // Low stock items count
    const lowStockCount = medicines.filter(m => m.stock <= m.reorderLevel).length;
    
    // Expiring soon items count (within 30 days)
    const now = new Date();
    const expiringCount = medicines.filter(m => {
      const expiry = new Date(m.expiry);
      const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;
    
    return {
      totalSales,
      totalProfit,
      stockItems,
      totalRefunds,
      refundsCount: refunds.length,
      lowStockCount,
      expiringCount
    };
  }, [sales, medicines, refunds]);
  
  const summaryCards = [
    { 
      title: "Total Sales", 
      value: `${settings.currency}${stats.totalSales.toLocaleString()}`, 
      icon: DollarSign, 
      trend: `${sales.length} transactions` 
    },
    { 
      title: "Profit", 
      value: `${settings.currency}${stats.totalProfit.toLocaleString()}`, 
      icon: TrendingUp, 
      trend: "All time" 
    },
    { 
      title: "Stock Items", 
      value: `${stats.stockItems}`, 
      icon: Package, 
      trend: `${stats.lowStockCount} low stock` 
    },
    { 
      title: "Refunds", 
      value: `${settings.currency}${stats.totalRefunds.toLocaleString()}`, 
      icon: Receipt, 
      trend: `${stats.refundsCount} refunds` 
    },
  ];

  const alerts = [
    { 
      type: "Low Stock", 
      message: stats.lowStockCount > 0 
        ? `${stats.lowStockCount} item${stats.lowStockCount !== 1 ? 's' : ''} running low` 
        : "No low stock items", 
      icon: AlertTriangle,
      hasAlert: stats.lowStockCount > 0
    },
    { 
      type: "Expiry Soon", 
      message: stats.expiringCount > 0 
        ? `${stats.expiringCount} item${stats.expiringCount !== 1 ? 's' : ''} expiring soon` 
        : "No items expiring soon", 
      icon: AlertTriangle,
      hasAlert: stats.expiringCount > 0
    },
  ];

  const quickLinks = [
    { title: "New Bill", url: "/billing", icon: ShoppingCart, color: "bg-primary" },
    { title: "Medicines", url: "/medicines", icon: Package, color: "bg-secondary" },
    { title: "Reports", url: "/reports", icon: Receipt, color: "bg-accent" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => (
          <Card key={idx} className="glass glass-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Daily Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">Chart placeholder - Sales data will appear here</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Monthly Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">Chart placeholder - Profit data will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-3 p-3 rounded-lg ${
                alert.hasAlert ? 'bg-destructive/10 border border-destructive/20' : 'bg-muted/50'
              }`}
            >
              <alert.icon className={`w-5 h-5 ${alert.hasAlert ? 'text-destructive' : 'text-muted-foreground'}`} />
              <div>
                <p className="font-medium text-sm">{alert.type}</p>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link, idx) => (
            <Link key={idx} to={link.url}>
              <Card className="glass glass-hover cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center`}>
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">Go to {link.title}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
