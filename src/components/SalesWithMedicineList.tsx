import { useState } from "react";
import { getSalesByMedicineId, getRefundedQuantity, type Sale } from "@/lib/storage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefundDialog } from "@/components/RefundDialog";
import { format } from "date-fns";
import { ShoppingCart } from "lucide-react";

interface SalesWithMedicineListProps {
  medicineId: string;
}

export function SalesWithMedicineList({ medicineId }: SalesWithMedicineListProps) {
  const [selectedSale, setSelectedSale] = useState<{ sale: Sale; medicineId: string } | null>(null);
  const sales = getSalesByMedicineId(medicineId);

  if (sales.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 font-semibold">No Sales Found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          This medicine hasn't been sold yet.
        </p>
      </div>
    );
  }

  const getSaleStatus = (sale: Sale, medicineId: string) => {
    const item = sale.items.find(i => i.medicineId === medicineId);
    if (!item) return { status: 'unknown', variant: 'secondary' as const };

    const refunded = getRefundedQuantity(sale.id, medicineId);
    
    if (refunded === 0) {
      return { status: 'Available', variant: 'default' as const };
    } else if (refunded < item.quantity) {
      return { status: 'Partially Refunded', variant: 'secondary' as const };
    } else {
      return { status: 'Fully Refunded', variant: 'outline' as const };
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Sales History</h3>
          <Badge variant="secondary">{sales.length} sale(s) found</Badge>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Qty Sold</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Refunded</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => {
                const item = sale.items.find(i => i.medicineId === medicineId);
                if (!item) return null;

                const refunded = getRefundedQuantity(sale.id, medicineId);
                const available = item.quantity - refunded;
                const status = getSaleStatus(sale, medicineId);

                return (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {format(new Date(sale.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {sale.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {sale.customerName || 'Walk-in Customer'}
                      {sale.customerPhone && (
                        <div className="text-xs text-muted-foreground">{sale.customerPhone}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">PKR {item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {refunded > 0 ? (
                        <span className="text-destructive">{refunded}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">{available}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={available === 0}
                        onClick={() => setSelectedSale({ sale, medicineId })}
                      >
                        Refund
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedSale && (
        <RefundDialog
          open={!!selectedSale}
          onOpenChange={(open) => !open && setSelectedSale(null)}
          sale={selectedSale.sale}
          medicineId={selectedSale.medicineId}
        />
      )}
    </>
  );
}
