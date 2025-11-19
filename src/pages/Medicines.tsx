import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMedicines, deleteMedicine, Medicine, getSettings } from "@/lib/storage";
import { AddMedicineDialog } from "@/components/AddMedicineDialog";
import { EditMedicineDialog } from "@/components/EditMedicineDialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Medicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const settings = getSettings();

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    filterMedicines();
  }, [searchQuery, medicines]);

  const loadMedicines = () => {
    const data = getMedicines();
    setMedicines(data);
    setFilteredMedicines(data);
  };

  const filterMedicines = () => {
    if (!searchQuery) {
      setFilteredMedicines(medicines);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.company.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query) ||
        m.batchNumber.toLowerCase().includes(query)
    );
    setFilteredMedicines(filtered);
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setMedicineToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (medicineToDelete) {
      deleteMedicine(medicineToDelete);
      toast({
        title: "Success",
        description: "Medicine deleted successfully",
      });
      loadMedicines();
    }
    setDeleteDialogOpen(false);
    setMedicineToDelete(null);
  };

  const isExpired = (expiry: string) => {
    return new Date(expiry) < new Date();
  };

  const isExpiringSoon = (expiry: string) => {
    const expiryDate = new Date(expiry);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  // Group by company
  const medicinesByCompany = filteredMedicines.reduce((acc, medicine) => {
    if (!acc[medicine.company]) {
      acc[medicine.company] = [];
    }
    acc[medicine.company].push(medicine);
    return acc;
  }, {} as Record<string, Medicine[]>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medicines</h1>
          <p className="text-muted-foreground">Manage your medicine inventory</p>
        </div>
        <AddMedicineDialog onMedicineAdded={loadMedicines} />
      </div>

      {/* Search & Filters */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, category, or batch..."
                className="pl-10 bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medicines Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>All Medicines ({filteredMedicines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Cost Price</TableHead>
                  <TableHead className="text-right">Sale Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No medicines found. Add your first medicine to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMedicines.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {medicine.name}
                          {(isExpired(medicine.expiry) || isExpiringSoon(medicine.expiry)) && (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{medicine.company}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{medicine.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{settings.currency}{medicine.costPrice}</TableCell>
                      <TableCell className="text-right">{settings.currency}{medicine.salePrice}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={medicine.stock < medicine.reorderLevel ? "destructive" : "secondary"}>
                          {medicine.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={isExpired(medicine.expiry) ? "text-destructive font-semibold" : isExpiringSoon(medicine.expiry) ? "text-yellow-600 dark:text-yellow-500" : ""}>
                          {medicine.expiry}
                        </span>
                      </TableCell>
                      <TableCell>{medicine.batchNumber}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(medicine)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDeleteClick(medicine.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Company Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(medicinesByCompany).map(([company, items]) => (
          <Card key={company} className="glass">
            <CardHeader>
              <CardTitle className="text-lg">{company}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-semibold">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Stock:</span>
                  <span className="font-semibold">{items.reduce((sum, item) => sum + item.stock, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EditMedicineDialog
        medicine={editingMedicine}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onMedicineUpdated={loadMedicines}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medicine from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Medicines;
