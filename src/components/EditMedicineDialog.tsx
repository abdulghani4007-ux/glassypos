import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMedicine, Medicine } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface EditMedicineDialogProps {
  medicine: Medicine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMedicineUpdated: () => void;
}

export function EditMedicineDialog({ medicine, open, onOpenChange, onMedicineUpdated }: EditMedicineDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    category: '',
    costPrice: '',
    salePrice: '',
    stock: '',
    reorderLevel: '',
    expiry: '',
    batchNumber: '',
  });

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        company: medicine.company,
        category: medicine.category,
        costPrice: medicine.costPrice.toString(),
        salePrice: medicine.salePrice.toString(),
        stock: medicine.stock.toString(),
        reorderLevel: medicine.reorderLevel.toString(),
        expiry: medicine.expiry,
        batchNumber: medicine.batchNumber,
      });
    }
  }, [medicine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medicine) return;
    
    try {
      updateMedicine(medicine.id, {
        name: formData.name,
        company: formData.company,
        category: formData.category,
        costPrice: parseFloat(formData.costPrice),
        salePrice: parseFloat(formData.salePrice),
        stock: parseInt(formData.stock),
        reorderLevel: parseInt(formData.reorderLevel),
        expiry: formData.expiry,
        batchNumber: formData.batchNumber,
      });
      
      toast({
        title: "Success",
        description: "Medicine updated successfully",
      });
      
      onOpenChange(false);
      onMedicineUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update medicine",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Medicine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Medicine Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company *</Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-batchNumber">Batch Number *</Label>
              <Input
                id="edit-batchNumber"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-costPrice">Cost Price *</Label>
              <Input
                id="edit-costPrice"
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-salePrice">Sale Price *</Label>
              <Input
                id="edit-salePrice"
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Stock Quantity *</Label>
              <Input
                id="edit-stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reorderLevel">Reorder Level *</Label>
              <Input
                id="edit-reorderLevel"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiry">Expiry Date *</Label>
              <Input
                id="edit-expiry"
                type="date"
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Medicine</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
