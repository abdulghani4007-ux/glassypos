import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, CheckCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUdhars, addUdhar, updateUdhar, Udhar as UdharType, getSettings } from "@/lib/storage";
import { toast } from "sonner";

const Udhar = () => {
  const [udhars, setUdhars] = useState<UdharType[]>(getUdhars());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    amount: "",
    dueDate: "",
    invoiceNo: "",
    note: ""
  });
  const settings = getSettings();

  // Filter and search
  const filteredUdhars = useMemo(() => {
    let filtered = udhars;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(u => u.status === filterStatus);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [udhars, searchQuery, filterStatus]);

  const totalUnpaid = udhars
    .filter(u => u.status === 'unpaid')
    .reduce((sum, u) => sum + u.amount, 0);

  const paidThisMonth = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    return udhars
      .filter(u => {
        if (u.status === 'paid' && u.paidDate) {
          const paidDate = new Date(u.paidDate);
          return paidDate.getMonth() === thisMonth && paidDate.getFullYear() === thisYear;
        }
        return false;
      })
      .reduce((sum, u) => sum + u.amount, 0);
  }, [udhars]);

  const handleAddUdhar = () => {
    if (!formData.customerName || !formData.amount || !formData.invoiceNo) {
      toast.error("Please fill all required fields");
      return;
    }

    const newUdhar = addUdhar({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone || undefined,
      amount: parseFloat(formData.amount),
      status: 'unpaid',
      date: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate || undefined,
      invoiceNo: formData.invoiceNo,
      note: formData.note || undefined
    });

    setUdhars(getUdhars());
    setIsAddDialogOpen(false);
    setFormData({
      customerName: "",
      customerPhone: "",
      amount: "",
      dueDate: "",
      invoiceNo: "",
      note: ""
    });
    toast.success("Udhar record added successfully");
  };

  const handleMarkAsPaid = (id: string) => {
    updateUdhar(id, {
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0]
    });
    setUdhars(getUdhars());
    toast.success("Marked as paid");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Udhar / Credit Ledger</h1>
          <p className="text-muted-foreground">Track and manage credit transactions</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Udhar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-destructive/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              Total Unpaid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{settings.currency}{totalUnpaid.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              {udhars.filter(u => u.status === 'unpaid').length} customers
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-secondary/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-secondary" />
              Paid This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{settings.currency}{paidThisMonth.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              {udhars.filter(u => {
                if (u.status === 'paid' && u.paidDate) {
                  const paidDate = new Date(u.paidDate);
                  const now = new Date();
                  return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
                }
                return false;
              }).length} transactions
            </p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{udhars.length}</p>
            <p className="text-sm text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or invoice..."
                className="pl-10 bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button 
              variant={filterStatus === 'unpaid' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('unpaid')}
            >
              Unpaid
            </Button>
            <Button 
              variant={filterStatus === 'paid' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('paid')}
            >
              Paid
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Udhar Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Credit Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUdhars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUdhars.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.customerName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{record.invoiceNo}</TableCell>
                      <TableCell className="text-right font-semibold">{settings.currency}{record.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        {record.status === "unpaid" ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Unpaid
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Paid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{record.date}</TableCell>
                      <TableCell className="text-sm">
                        {record.status === "unpaid" ? record.dueDate || '-' : record.paidDate}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.status === "unpaid" ? (
                          <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(record.id)}>
                            Mark as Paid
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">Settled</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Udhar Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Udhar Record</DialogTitle>
            <DialogDescription>Add a new credit transaction record</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="invoiceNo">Invoice No. *</Label>
              <Input
                id="invoiceNo"
                value={formData.invoiceNo}
                onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                placeholder="INV-001"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUdhar}>Add Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Udhar;
