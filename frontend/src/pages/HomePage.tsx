import { WelcomeCard } from "../components/dashboard/WelcomeCard";
import { QuickActionsCard } from "../components/dashboard/QuickActionsCard";
import { PoliciesCard } from "../components/dashboard/PoliciesCard";

export function HomePage() {
  return (
    <div className="space-y-6">
      <WelcomeCard/>
      <PoliciesCard/>
      <QuickActionsCard/>
    </div>
  );
}

