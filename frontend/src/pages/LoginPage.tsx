import { AuthPanel } from '../components/auth/AuthPanel';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Pet Insurance Assistant</h1>
        <AuthPanel />
      </div>
    </div>
  );
}

