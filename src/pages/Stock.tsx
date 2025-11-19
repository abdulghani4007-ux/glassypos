import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, AlertTriangle, Package } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMedicines, updateMedicine, Medicine } from "@/lib/storage";
import { toast } from "sonner";

const Stock = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(getMedicines());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "low" | "expiring">("all");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [adjustType, setAdjustType] = useState<"add" | "remove">("add");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredMedicines = useMemo(() => {
    return medicines.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           med.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterType === "low") {
        return matchesSearch && med.stock <= med.reorderLevel;
      }
      
      if (filterType === "expiring") {
        const today = new Date();
        const expiryDate = new Date(med.expiry);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(today.getMonth() + 3);
        return matchesSearch && expiryDate <= threeMonthsFromNow && expiryDate > today;
      }
      
      return matchesSearch;
    });
  }, [medicines, searchTerm, filterType]);

  const lowStockCount = medicines.filter(m => m.stock <= m.reorderLevel).length;
  
  const expiringCount = medicines.filter(m => {
    const today = new Date();
    const expiryDate = new Date(m.expiry);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow && expiryDate > today;
  }).length;

  const getStatus = (medicine: Medicine) => {
    if (medicine.stock <= medicine.reorderLevel) return "low";
    
    const today = new Date();
    const expiryDate = new Date(medicine.expiry);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    if (expiryDate <= threeMonthsFromNow && expiryDate > today) return "expiring";
    
    return "good";
  };

  const openAdjustDialog = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setAdjustAmount("");
    setAdjustType("add");
    setIsDialogOpen(true);
  };

  const handleAdjustStock = () => {
    if (!selectedMedicine || !adjustAmount) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amount = parseInt(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a positive number");
      return;
    }

    const newStock = adjustType === "add" 
      ? selectedMedicine.stock + amount 
      : selectedMedicine.stock - amount;

    if (newStock < 0) {
      toast.error("Cannot reduce stock below zero");
      return;
    }

    try {
      updateMedicine(selectedMedicine.id, { stock: newStock });
      setMedicines(getMedicines());
      toast.success(`Stock ${adjustType === "add" ? "added" : "removed"} successfully`);
      setIsDialogOpen(false);
      setSelectedMedicine(null);
    } catch (error) {
      toast.error("Failed to update stock");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Management</h1>
          <p className="text-muted-foreground">Monitor and adjust inventory levels</p>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{lowStockCount} {lowStockCount === 1 ? 'item' : 'items'}</p>
            <p className="text-sm text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
        <Card className="glass border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{expiringCount} {expiringCount === 1 ? 'item' : 'items'}</p>
            <p className="text-sm text-muted-foreground">Expiring within 3 months</p>
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
                placeholder="Search medicines..."
                className="pl-10 bg-background/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant={filterType === "low" ? "default" : "outline"}
              onClick={() => setFilterType(filterType === "low" ? "all" : "low")}
            >
              Show Low Stock
            </Button>
            <Button 
              variant={filterType === "expiring" ? "default" : "outline"}
              onClick={() => setFilterType(filterType === "expiring" ? "all" : "expiring")}
            >
              Show Expiring
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Current Stock ({filteredMedicines.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMedicines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No medicines found</p>
              <p className="text-sm">Add medicines from the Medicines page</p>
            </div>
          ) : (
            <div className="rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Reorder Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Batch No.</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine) => {
                    const status = getStatus(medicine);
                    return (
                      <TableRow key={medicine.id}>
                        <TableCell className="font-medium">{medicine.name}</TableCell>
                        <TableCell className="text-muted-foreground">{medicine.company}</TableCell>
                        <TableCell className="text-right">{medicine.stock}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{medicine.reorderLevel}</TableCell>
                        <TableCell>
                          {status === "low" && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </Badge>
                          )}
                          {status === "expiring" && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Expiring Soon
                            </Badge>
                          )}
                          {status === "good" && (
                            <Badge variant="secondary">Good Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(medicine.expiry).toLocaleDateString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{medicine.batchNumber}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openAdjustDialog(medicine)}
                          >
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjust Stock Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          {selectedMedicine && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-semibold">{selectedMedicine.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMedicine.company}</p>
                <p className="text-sm mt-2">Current Stock: <span className="font-bold">{selectedMedicine.stock}</span></p>
              </div>

              <div className="space-y-2">
                <Label>Adjustment Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={adjustType === "add" ? "default" : "outline"}
                    onClick={() => setAdjustType("add")}
                  >
                    Add Stock
                  </Button>
                  <Button
                    type="button"
                    variant={adjustType === "remove" ? "default" : "outline"}
                    onClick={() => setAdjustType("remove")}
                  >
                    Remove Stock
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
              </div>

              {adjustAmount && !isNaN(parseInt(adjustAmount)) && (
                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-sm">New Stock Level:</p>
                  <p className="text-2xl font-bold">
                    {adjustType === "add"
                      ? selectedMedicine.stock + parseInt(adjustAmount)
                      : selectedMedicine.stock - parseInt(adjustAmount)}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustStock}>
              Confirm Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stock;
