import { OutstandingClasswise } from "@/components/performance/OutstandingClasswise";
import { UnpaidStudents } from "@/components/fees/UnpaidStudents";

export default function OutstandingPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return (
    <div className="space-y-6">
      <UnpaidStudents
        month={month}
        year={year}
        title="Current month unpaid list"
        scrollable
        maxHeight="max-h-[500px]"
      />
      <OutstandingClasswise title="Outstanding by class (all months)" />
    </div>
  );
}

