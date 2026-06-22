import {
  Plus,
  ArrowUp,
  RefreshCw,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  AlertCircle,
  Package,
} from "lucide-react";
import {
  HeroAction,
  StatCardProps,
  MetricCardProps,
  SalesRow,
  ActivityItem,
  InventoryCardProps,
} from "../types/dashboard";

export const defaultHeroActions: HeroAction[] = [
  { label: "Add", icon: Plus, variant: "primary" },
  { label: "Send", icon: ArrowUp, variant: "secondary" },
  { label: "Request", icon: RefreshCw, variant: "secondary" },
  { label: "More", icon: MoreHorizontal, variant: "secondary", iconOnly: true },
];

export const defaultDeliveryStats: StatCardProps[] = [
  {
    icon: ArrowUpRight,
    bgClassName: "bg-[#0A4C5A]",
    label: "Deliveries Completed",
    value: "42 Units",
    trend: { value: "45.0%", direction: "up", tone: "positive" },
  },
  {
    icon: ArrowDownRight,
    bgClassName: "bg-[#00D084]",
    label: "Failed / Rescheduled",
    value: "2 Units",
    trend: { value: "12.5%", direction: "down", tone: "negative" },
  },
];

export const defaultMetricCards: MetricCardProps[] = [
  {
    icon: Building2,
    iconClassName: "text-gray-500",
    title: "Top Customer",
    period: "Last 30 days",
    headline: "Selso (₱165)",
    badge: { value: "160%", direction: "up", tone: "positive" },
    note: "vs. Ludy (₱150)",
  },
  {
    icon: AlertCircle,
    iconClassName: "text-red-400",
    title: "Inactive Client",
    period: "Last 30 days",
    headline: "J. Camalla",
    badge: { value: "82%", direction: "down", tone: "negative" },
    note: "10 bottles held, 0 sales",
  },
];

export const defaultSalesRows: SalesRow[] = [
  { date: "18 Oct", transactions: 13, notables: "Selso (165), Geralyn (135)" },
  { date: "25 Oct", transactions: 12, notables: "Elvie (90), Walk-in (90)" },
  { date: "2 Nov", transactions: 9, notables: "Jenalyn (90)" },
];

export const defaultPeriodLabels: string[] = [
  "18 Oct",
  "25 Oct",
  "2 Nov",
  "9 Nov",
];

export const defaultActivity: ActivityItem[] = [
  {
    icon: Plus,
    iconClassName: "text-[#00D084]",
    name: "Geralyn",
    meta: "9 Units • Oct 18, 2024",
    amount: "₱ 135.00",
    subtext: "Unpaid Debt",
    status: { label: "Pending", tone: "negative" },
  },
  {
    icon: ArrowUpRight,
    iconClassName: "text-[#00D084]",
    name: "Jenalyn",
    meta: "3 Units • Oct 24, 2024",
    amount: "₱ 90.00",
    subtext: "Cash / Gcash",
    status: { label: "Success", tone: "positive" },
  },
];

export const defaultInventory: InventoryCardProps = {
  hero: {
    label: "5 GAL. ROUND",
    maskedCode: "•••• •••• •••• 0250",
    units: "250 Units",
    statusLabel: "Status: Healthy Stock",
  },
  stockItem: { label: "Slim Bottles", value: 180, max: 200 },
};