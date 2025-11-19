import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  canRefundItem,
  addRefund,
  calculatePartialRefundAmount,
  getMedicines,
  type Sale,
  type RefundItem,
} from "@/lib/storage";
import { toast } from "sonner";
import { AlertCircle, Package } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale;
  medicineId: string;
}

export function RefundDialog({ open, onOpenChange, sale, medicineId }: RefundDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const saleItem = sale.items.find(i => i.medicineId === medicineId);
  const medicine = getMedicines().find(m => m.id === medicineId);
  
  const validation = canRefundItem(sale.id, medicineId, quantity);
  const maxQuantity = validation.availableQuantity || 0;

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setReason("");
      setNotes("");
    }
  }, [open]);

  if (!saleItem || !medicine) {
    return null;
  }

  const refundItem: RefundItem = {
    medicineId: medicine.id,
    medicineName: medicine.name,
    company: medicine.company,
    batchNumber: medicine.batchNumber,
    quantity: quantity,
    originalQuantity: saleItem.quantity,
    unitPrice: saleItem.price,
    discount: saleItem.discount || 0,
    totalPrice: saleItem.price * quantity - (saleItem.discount || 0) * quantity,
  };

  const refundAmount = calculatePartialRefundAmount(sale, [refundItem]);

  const handleRefund = async () => {
    if (!reason) {
      toast.error("Please select a reason for the refund");
      return;
    }

    if (!validation.valid) {
      toast.error(validation.message || "Cannot process refund");
      return;
    }

    setIsProcessing(true);

    try {
      addRefund({
        saleId: sale.id,
        invoiceNo: sale.id.substring(0, 12),
        date: new Date().toISOString(),
        items: [refundItem],
        amount: refundAmount,
        reason: reason as any,
        notes: notes || undefined,
        status: 'completed',
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
      });

      toast.success("Refund processed successfully", {
        description: `PKR ${refundAmount.toFixed(2)} refunded. Stock restored: +${quantity}`,
      });

      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to process refund", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Refund items from sale {sale.id.substring(0, 12)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sale Info */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-medium">{sale.customerName || 'Walk-in Customer'}</span>
            </div>
            {sale.customerPhone && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{sale.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sale Date:</span>
              <span className="font-medium">
                {new Date(sale.date).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Medicine Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-semibold">Medicine Details</Label>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="font-medium">{medicine.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Company:</span>
                <span className="font-medium">{medicine.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Batch:</span>
                <span className="font-medium">{medicine.batchNumber}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Quantity Purchased:</span>
                <span className="font-medium">{saleItem.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Available for Refund:</span>
                <span className="font-semibold text-primary">{maxQuantity}</span>
              </div>
            </div>
          </div>

          {/* Refund Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Refund Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
              />
              {!validation.valid && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validation.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Refund</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defective">Defective Product</SelectItem>
                  <SelectItem value="expired">Expired Medicine</SelectItem>
                  <SelectItem value="wrong_item">Wrong Item Sold</SelectItem>
                  <SelectItem value="customer_request">Customer Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Refund Summary */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-2">
            <h4 className="font-semibold">Refund Summary</h4>
            <Separator />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit Price:</span>
                <span>PKR {saleItem.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span>{quantity}</span>
              </div>
              {saleItem.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="text-destructive">
                    -PKR {(saleItem.discount * quantity).toFixed(2)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total Refund Amount:</span>
                <span className="text-primary">PKR {refundAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Stock Restoration:</span>
                <span className="text-green-600">+{quantity} to current stock</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleRefund} disabled={!validation.valid || !reason || isProcessing}>
            {isProcessing ? "Processing..." : "Process Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
