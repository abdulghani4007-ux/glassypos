import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicineRefundSearch } from "@/components/MedicineRefundSearch";
import { RefundHistoryTable } from "@/components/RefundHistoryTable";
import { RotateCcw } from "lucide-react";

export default function Refunds() {
  const [activeTab, setActiveTab] = useState("medicine-search");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <RotateCcw className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refunds</h1>
          <p className="text-muted-foreground">Process refunds and view refund history</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="medicine-search">Search by Medicine</TabsTrigger>
          <TabsTrigger value="history">Refund History</TabsTrigger>
        </TabsList>

        <TabsContent value="medicine-search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Medicine</CardTitle>
              <CardDescription>
                Search for a medicine to view all sales and process refunds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MedicineRefundSearch />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Refund History</CardTitle>
              <CardDescription>
                View all processed refunds with filters and export options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RefundHistoryTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
