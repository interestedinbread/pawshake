import { AuthPanel } from '../components/auth/AuthPanel';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--color-dark-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className='flex items-center justify-center gap-2 mb-6'>
          <h1 className="text-4xl font-semibold text-[var(--color-dark-text-primary)] font-['Nunito']">Policy Boi</h1>
          <img src="/noun-paw-print.svg" 
          className='h-10 w-auto'/>
        </div>
        <AuthPanel />
      </div>
    </div>
  );
}

