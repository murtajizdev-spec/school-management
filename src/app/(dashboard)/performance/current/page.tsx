import { PeriodCards } from "@/components/performance/PeriodCards";
import { UnpaidStudents } from "@/components/fees/UnpaidStudents";
import { PeriodExpenses } from "@/components/performance/PeriodExpenses";

export default function CurrentPerformancePage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return (
    <div className="space-y-6">
      <PeriodCards
        period="currentMonth"
        heading="Current month performance"
        description="Net profit, collections, outstanding dues, and spend"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <PeriodExpenses title="Expenses this month" month={month} year={year} />
      </div>
    </div>
  );
}

