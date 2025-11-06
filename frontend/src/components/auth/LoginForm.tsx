import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import type { FormEvent } from "react";

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission
        setError(''); // Clear previous errors
        setIsSubmitting(true);

        try {
            await login(email, password);
            // Login successful - AuthContext will handle state update
            // You might want to redirect here or let parent component handle it
        } catch (err) {
            // Handle error - login function throws on failure
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                />

                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    fullWidth
                >
                    Login
                </Button>
            </form>
        </div>
    );
}