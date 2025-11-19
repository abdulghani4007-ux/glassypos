import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, TrendingUp, Users, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSales, getUdhars, getSettings } from "@/lib/storage";

interface CustomerData {
  name: string;
  phone: string;
  totalPurchases: number;
  udharAmount: number;
  lastVisit: string;
  transactionCount: number;
}

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const settings = getSettings();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const sales = getSales();
    const udhars = getUdhars();
    
    // Create a map to aggregate customer data
    const customerMap = new Map<string, CustomerData>();

    // Process sales data
    sales.forEach((sale) => {
      if (sale.customerName) {
        const key = `${sale.customerName}_${sale.customerPhone || ''}`;
        const existing = customerMap.get(key);

        if (existing) {
          existing.totalPurchases += sale.total;
          existing.transactionCount += 1;
          // Update last visit if this sale is more recent
          if (new Date(sale.date) > new Date(existing.lastVisit)) {
            existing.lastVisit = sale.date;
          }
        } else {
          customerMap.set(key, {
            name: sale.customerName,
            phone: sale.customerPhone || '',
            totalPurchases: sale.total,
            udharAmount: 0,
            lastVisit: sale.date,
            transactionCount: 1,
          });
        }
      }
    });

    // Add udhar amounts
    udhars.forEach((udhar) => {
      if (udhar.status === 'unpaid') {
        const key = `${udhar.customerName}_${udhar.customerPhone || ''}`;
        const customer = customerMap.get(key);
        
        if (customer) {
          customer.udharAmount += udhar.amount;
        } else {
          // Customer exists only in udhar records
          customerMap.set(key, {
            name: udhar.customerName,
            phone: udhar.customerPhone || '',
            totalPurchases: 0,
            udharAmount: udhar.amount,
            lastVisit: udhar.date,
            transactionCount: 0,
          });
        }
      }
    });

    // Convert map to array and sort by total purchases
    const customerArray = Array.from(customerMap.values()).sort(
      (a, b) => b.totalPurchases - a.totalPurchases
    );

    setCustomers(customerArray);
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;

    const query = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  const totalCustomers = customers.length;
  const totalSales = customers.reduce((sum, c) => sum + c.totalPurchases, 0);
  const totalUdhar = customers.reduce((sum, c) => sum + c.udharAmount, 0);
  const customersWithUdhar = customers.filter(c => c.udharAmount > 0).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active customers
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.currency}{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime value
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Udhar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.currency}{totalUdhar.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {customersWithUdhar} {customersWithUdhar === 1 ? 'customer' : 'customers'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              className="pl-10 bg-background/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Total Purchases</TableHead>
                  <TableHead className="text-right">Outstanding Udhar</TableHead>
                  <TableHead>Last Visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {customers.length === 0 
                        ? "No customers yet. Complete a sale to add your first customer."
                        : "No customers found matching your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        {customer.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No phone</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{customer.transactionCount}</TableCell>
                      <TableCell className="text-right font-medium">
                        {settings.currency}{customer.totalPurchases.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.udharAmount > 0 ? (
                          <Badge variant="destructive">{settings.currency}{customer.udharAmount.toLocaleString()}</Badge>
                        ) : (
                          <Badge variant="secondary">{settings.currency}0</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(customer.lastVisit).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
