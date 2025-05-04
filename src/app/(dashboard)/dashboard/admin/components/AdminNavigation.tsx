import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  Users,
  Package,
  Grid,
  MessageSquare,
  ShoppingCart,
  Settings
} from 'lucide-react'

const navigation = [
  { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "Brugere", href: "/dashboard/admin/users", icon: Users },
  { name: "Pakker", href: "/dashboard/packages", icon: Package },
  { name: "Produkt Slots", href: "/dashboard/admin/product-slots", icon: Grid },
  { name: "Beskeder", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Ordrer", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Indstillinger", href: "/dashboard/settings", icon: Settings },
];

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 py-4">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              isActive
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4 mr-2" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
} 