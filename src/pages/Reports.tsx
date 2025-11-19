import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Calendar, FileText } from "lucide-react";
import { getSales, getMedicines, getUdhars, getSettings } from "@/lib/storage";

const Reports = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);

  const sales = getSales();
  const medicines = getMedicines();
  const udhars = getUdhars();
  const settings = getSettings();

  // Apply date filtering
  const filteredSales = useMemo(() => {
    if (!isFiltered) return sales;

    let filtered = sales;

    if (fromDate) {
      filtered = filtered.filter(s => s.date >= fromDate);
    }

    if (toDate) {
      filtered = filtered.filter(s => s.date <= toDate);
    }

    return filtered;
  }, [sales, fromDate, toDate, isFiltered]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const todaySales = sales.filter(s => s.date === today).reduce((sum, s) => sum + s.total, 0);
    const weekSales = sales.filter(s => s.date >= weekAgo).reduce((sum, s) => sum + s.total, 0);
    const monthSales = sales.filter(s => s.date >= monthStart).reduce((sum, s) => sum + s.total, 0);

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

    return { todaySales, weekSales, monthSales, totalProfit };
  }, [sales, medicines]);

  // Report data
  const reportData = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const dailySales = filteredSales.filter(s => s.date === today);
    const weeklySales = filteredSales.filter(s => s.date >= weekAgo);
    const monthlySales = filteredSales.filter(s => s.date >= monthStart);

    const lowStockItems = medicines.filter(m => m.stock <= m.reorderLevel);
    const expiringItems = medicines.filter(m => {
      const expiry = new Date(m.expiry);
      const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    });

    const totalUnpaidUdhar = udhars.filter(u => u.status === 'unpaid').reduce((sum, u) => sum + u.amount, 0);

    return {
      sales: [
        { name: "Daily Sales", count: `${dailySales.length} records`, data: dailySales },
        { name: "Weekly Sales", count: `${weeklySales.length} records`, data: weeklySales },
        { name: "Monthly Sales", count: `${monthlySales.length} records`, data: monthlySales },
      ],
      stock: [
        { name: "Current Stock", count: `${medicines.length} items`, data: medicines },
        { name: "Low Stock Items", count: `${lowStockItems.length} items`, data: lowStockItems },
        { name: "Expiring Soon", count: `${expiringItems.length} items`, data: expiringItems },
      ],
      financial: [
        { name: "Profit/Loss", count: `${settings.currency}${stats.totalProfit.toLocaleString()}`, data: null },
        { name: "Total Sales", count: `${settings.currency}${stats.monthSales.toLocaleString()}`, data: null },
        { name: "Outstanding Udhar", count: `${settings.currency}${totalUnpaidUdhar.toLocaleString()}`, data: null },
      ]
    };
  }, [filteredSales, medicines, udhars, stats]);

  const handleApplyFilter = () => {
    setIsFiltered(true);
  };

  const handleClearFilter = () => {
    setFromDate("");
    setToDate("");
    setIsFiltered(false);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(item => Object.values(item).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  const reportSections = [
    {
      title: "Sales Reports",
      description: "View and export sales data",
      reports: reportData.sales
    },
    {
      title: "Stock Reports",
      description: "Inventory and stock movement",
      reports: reportData.stock
    },
    {
      title: "Financial Reports",
      description: "Profit and expense analysis",
      reports: reportData.financial
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Generate and export business reports</p>
      </div>

      {/* Date Range Filter */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">From Date</label>
              <Input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">To Date</label>
              <Input 
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleApplyFilter}>Apply Filter</Button>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleClearFilter}
              >
                Clear Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Sections */}
      {reportSections.map((section, idx) => (
        <Card key={idx} className="glass">
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {section.reports.map((report, ridx) => (
                <div key={ridx} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">{report.count}</p>
                    </div>
                  </div>
                  {report.data && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => exportToCSV(report.data, report.name.toLowerCase().replace(/\s+/g, '-'))}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Today's Sales</p>
            <p className="text-2xl font-bold">{settings.currency}{stats.todaySales.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold">{settings.currency}{stats.weekSales.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">{settings.currency}{stats.monthSales.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Profit</p>
            <p className="text-2xl font-bold text-secondary">{settings.currency}{stats.totalProfit.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
