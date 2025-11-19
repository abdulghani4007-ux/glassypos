import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Printer, Search } from "lucide-react";
import { getSales, Sale, getSettings } from "@/lib/storage";
import { format } from "date-fns";

const SaleHistory = () => {
  const [sales] = useState<Sale[]>(getSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const settings = getSettings();

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = 
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerPhone?.includes(searchTerm);
      
      const matchesPayment = paymentFilter === "all" || sale.paymentType === paymentFilter;
      
      const saleDate = new Date(sale.date);
      const matchesStartDate = !startDate || saleDate >= new Date(startDate);
      const matchesEndDate = !endDate || saleDate <= new Date(endDate);
      
      return matchesSearch && matchesPayment && matchesStartDate && matchesEndDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, searchTerm, paymentFilter, startDate, endDate]);

  const handlePrint = (sale: Sale) => {
    setSelectedSale(sale);
    setTimeout(() => window.print(), 100);
  };

  const getPaymentBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      cash: "default",
      card: "secondary",
      udhar: "destructive",
    };
    return <Badge variant={variants[type] || "default"}>{type.toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sale History</h1>
        <p className="text-muted-foreground">View and manage all past sales transactions</p>
      </div>

      {/* Filters */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoice, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="From Date"
              />
            </div>
            <div>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="To Date"
              />
            </div>
            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Payments</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="udhar">Udhar</option>
              </select>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setPaymentFilter("all");
                setStartDate("");
                setEndDate("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Sales Transactions ({filteredSales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No sales found</p>
              <p className="text-sm">Start making sales to see them here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>{format(new Date(sale.date), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>
                      {sale.customerName || "Walk-in"}
                      {sale.customerPhone && (
                        <div className="text-sm text-muted-foreground">{sale.customerPhone}</div>
                      )}
                    </TableCell>
                    <TableCell>{sale.items.length} items</TableCell>
                    <TableCell className="font-semibold">{settings.currency}{sale.total.toFixed(2)}</TableCell>
                    <TableCell>{getPaymentBadge(sale.paymentType)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrint(sale)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sale Detail Dialog */}
      <Dialog open={selectedSale !== null} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sale Details - {selectedSale?.id}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{format(new Date(selectedSale.date), "dd/MM/yyyy HH:mm:ss")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Type</p>
                  <p className="font-medium">{getPaymentBadge(selectedSale.paymentType)}</p>
                </div>
                {selectedSale.customerName && (
                  <div>
                    <p className="text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{selectedSale.customerName}</p>
                  </div>
                )}
                {selectedSale.customerPhone && (
                  <div>
                    <p className="text-muted-foreground">Customer Phone</p>
                    <p className="font-medium">{selectedSale.customerPhone}</p>
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Items Sold</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div>{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.company}</div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{settings.currency}{item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.discount}%</TableCell>
                        <TableCell className="text-right">
                          {settings.currency}{(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{settings.currency}{selectedSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span>-{settings.currency}{selectedSale.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{settings.currency}{selectedSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{settings.currency}{selectedSale.total.toFixed(2)}</span>
                </div>
                {selectedSale.paymentType === "cash" && selectedSale.cashReceived && (
                  <>
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-muted-foreground">Cash Received</span>
                      <span>{settings.currency}{selectedSale.cashReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Change Returned</span>
                      <span>{settings.currency}{(selectedSale.changeReturned || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <Button onClick={() => handlePrint(selectedSale)} className="w-full">
                <Printer className="w-4 h-4 mr-2" />
                Print Invoice
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SaleHistory;
