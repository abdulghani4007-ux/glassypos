import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMedicines, type Medicine } from "@/lib/storage";
import { SalesWithMedicineList } from "@/components/SalesWithMedicineList";
import { Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function MedicineRefundSearch() {
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [open, setOpen] = useState(false);
  const medicines = getMedicines();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="medicine-search">Select Medicine</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedMedicine
                ? `${selectedMedicine.name} - ${selectedMedicine.company} (${selectedMedicine.batchNumber})`
                : "Search for a medicine..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[600px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search medicine by name, company, or batch..." />
              <CommandList>
                <CommandEmpty>No medicine found.</CommandEmpty>
                <CommandGroup>
                  {medicines.map((medicine) => (
                    <CommandItem
                      key={medicine.id}
                      value={`${medicine.name} ${medicine.company} ${medicine.batchNumber}`}
                      onSelect={() => {
                        setSelectedMedicine(medicine);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedMedicine?.id === medicine.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{medicine.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {medicine.company} • Batch: {medicine.batchNumber} • Stock: {medicine.stock}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedMedicine && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Selected:</span>
            <span>{selectedMedicine.name}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{selectedMedicine.company}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Batch: {selectedMedicine.batchNumber}</span>
          </div>
        </div>
      )}

      {selectedMedicine && (
        <SalesWithMedicineList medicineId={selectedMedicine.id} />
      )}
    </div>
  );
}
