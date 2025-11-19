import { useState } from "react";
import { getRefunds, type Refund } from "@/lib/storage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Search, FileText } from "lucide-react";

export function RefundHistoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const refunds = getRefunds().sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = !searchTerm || 
      refund.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.items.some(item => item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesReason = reasonFilter === "all" || refund.reason === reasonFilter;
    
    return matchesSearch && matchesReason;
  });

  const getReasonBadge = (reason: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      defective: { variant: 'destructive', label: 'Defective' },
      expired: { variant: 'destructive', label: 'Expired' },
      wrong_item: { variant: 'secondary', label: 'Wrong Item' },
      customer_request: { variant: 'default', label: 'Customer Request' },
      other: { variant: 'outline', label: 'Other' },
    };
    
    return variants[reason] || { variant: 'outline', label: reason };
  };

  if (refunds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 font-semibold">No Refunds Yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Refunds will appear here once they are processed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by customer, invoice, or medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-[200px] space-y-2">
          <Label htmlFor="reason-filter">Reason</Label>
          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger id="reason-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reasons</SelectItem>
              <SelectItem value="defective">Defective</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="wrong_item">Wrong Item</SelectItem>
              <SelectItem value="customer_request">Customer Request</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRefunds.map((refund) => {
              const reasonBadge = getReasonBadge(refund.reason);
              
              return (
                <TableRow key={refund.id}>
                  <TableCell>
                    {format(new Date(refund.date), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {refund.invoiceNo}
                  </TableCell>
                  <TableCell>
                    {refund.customerName || 'Walk-in Customer'}
                    {refund.customerPhone && (
                      <div className="text-xs text-muted-foreground">{refund.customerPhone}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {refund.items.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">{item.medicineName}</span>
                        <span className="text-muted-foreground"> (×{item.quantity})</span>
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={reasonBadge.variant}>{reasonBadge.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    PKR {refund.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={refund.status === 'completed' ? 'default' : 'secondary'}>
                      {refund.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredRefunds.length === 0 && refunds.length > 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">No Results Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
