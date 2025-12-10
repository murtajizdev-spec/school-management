import { subMonths } from "date-fns";
import { PeriodCards } from "@/components/performance/PeriodCards";
import { UnpaidStudents } from "@/components/fees/UnpaidStudents";
import { PeriodExpenses } from "@/components/performance/PeriodExpenses";

export default function PreviousPerformancePage() {
  const prev = subMonths(new Date(), 1);
  const month = prev.getMonth() + 1;
  const year = prev.getFullYear();

  return (
    <div className="space-y-6">
      <PeriodCards
        period="previousMonth"
        heading="Previous month performance"
        description="Compare last month’s profit, dues, and expenses"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <UnpaidStudents month={month} year={year} title="Outstanding last month" />
        <PeriodExpenses title="Expenses last month" month={month} year={year} />
      </div>
    </div>
  );
}

