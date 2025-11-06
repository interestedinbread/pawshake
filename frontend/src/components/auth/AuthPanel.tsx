import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Button } from "../common/Button";

type AuthMode = 'login' | 'register';

export function AuthPanel() {
    const [mode, setMode] = useState<AuthMode>('login');

    return (
        <div>
            {mode === 'login' ? <LoginForm /> : <RegisterForm />}
            <p className="py-4 text-center text-gray-600">
                {mode === 'login' ? 'Not yet signed up?' : 'Already signed up?'}
            </p>
            <Button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                variant="outline"
                size="md"
                fullWidth
            >
                {mode === 'login' ? 'Register' : 'Login'}
            </Button>
        </div>
    );
}