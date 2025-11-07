import { WelcomeCard } from "../components/dashboard/WelcomeCard";
import { QuickActionsCard } from "../components/dashboard/QuickActionsCard";

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-600">Welcome to your Pet Insurance Assistant!</p>
      </div>
      <div className="flex flex-col gap-8 mt-8">
        <WelcomeCard/>
        <QuickActionsCard/>
      </div>
    </div>
  );
}

