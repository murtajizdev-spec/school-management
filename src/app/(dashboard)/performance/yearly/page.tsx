import { PeriodCards } from "@/components/performance/PeriodCards";
import { PeriodExpenses } from "@/components/performance/PeriodExpenses";
import { FeeTrend } from "@/components/dashboard/FeeTrend";

export default function YearlyPerformancePage() {
  const now = new Date();
  const year = now.getFullYear();

  return (
    <div className="space-y-6">
      <PeriodCards
        period="yearToDate"
        heading="Year-to-date performance"
        description="Total fee inflow, dues, expenses, and profit for the academic year"
      />
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <FeeTrend />
        <PeriodExpenses title={`Expenses in ${year}`} year={year} />
      </div>
    </div>
  );
}

