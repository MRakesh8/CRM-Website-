import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Euro, PoundSterling, IndianRupee, JapaneseYen } from "lucide-react";

const currencies = [
  { code: "USD", name: "US Dollar", icon: DollarSign, symbol: "$" },
  { code: "EUR", name: "Euro", icon: Euro, symbol: "€" },
  { code: "GBP", name: "British Pound", icon: PoundSterling, symbol: "£" },
  { code: "INR", name: "Indian Rupee", icon: IndianRupee, symbol: "₹" },
  { code: "JPY", name: "Japanese Yen", icon: JapaneseYen, symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", icon: DollarSign, symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", icon: DollarSign, symbol: "A$" },
];

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={(val: any) => setCurrency(val)}>
      <SelectTrigger className="w-[140px] h-9">
        <SelectValue placeholder="Select Currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((curr) => {
          const Icon = curr.icon;
          return (
            <SelectItem key={curr.code} value={curr.code}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{curr.code}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
