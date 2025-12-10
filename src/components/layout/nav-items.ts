import {
  AlertTriangle,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/students", icon: Users },
  { label: "Fees & Slips", href: "/fees", icon: ClipboardList },
  { label: "Teachers", href: "/teachers", icon: GraduationCap },
  { label: "Expenses", href: "/expenses", icon: Wallet },
  { label: "Performance", href: "/performance/current", icon: TrendingUp },
  { label: "Archive", href: "/performance/archive", icon: LineChart },
  { label: "Outstanding", href: "/outstanding", icon: AlertTriangle },
];

