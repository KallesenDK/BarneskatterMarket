import { ProductSlot } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export default function ProductSlotList() {
  const [slots, setSlots] = useState<ProductSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSlots() {
      const { data, error } = await supabase
        .from("product_slots")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fejl ved hentning af product slots:", error);
        return;
      }

      setSlots(data);
      setLoading(false);
    }

    fetchSlots();
  }, []);

  if (loading) {
    return <div>Indlæser...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Produkt Slots</h2>
        <Button>Opret Ny Slot</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Navn</TableHead>
            <TableHead>Beskrivelse</TableHead>
            <TableHead>Antal Slots</TableHead>
            <TableHead>Pris</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slots.map((slot) => (
            <TableRow key={slot.id}>
              <TableCell>{slot.name}</TableCell>
              <TableCell>{slot.description}</TableCell>
              <TableCell>{slot.slots}</TableCell>
              <TableCell>{formatCurrency(slot.price)}</TableCell>
              <TableCell>
                {slot.is_active ? "Aktiv" : "Inaktiv"}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  Rediger
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 