import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { FeeTrend } from "@/components/dashboard/FeeTrend";
import { RecentStudents } from "@/components/dashboard/RecentStudents";
import { ExpenseBreakdown } from "@/components/dashboard/ExpenseBreakdown";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <OverviewCards />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <FeeTrend />
        <RecentStudents />
      </div>
      <ExpenseBreakdown />
    </div>
  );
}

