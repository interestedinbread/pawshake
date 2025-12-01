import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import { ApiError } from "../../api/apiClient";

export function RegisterForm () {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth()

    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setPasswordError('')

        // Validate passwords match
        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }

        // Validate password length (optional - you can adjust this)
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters')
            return
        }

        setIsSubmitting(true)
        try{
            await register(email, password)
        } catch (err) {
            console.error('Could not register user:', err)
            const statusCode = err instanceof ApiError ? err.statusCode : undefined;
            const errorMessage = getUserFriendlyErrorMessage(
              err,
              statusCode,
              { action: 'register', resource: 'account' }
            );
            setError(errorMessage);
        } finally {
            setIsSubmitting(false)
        }
    }

    return(
        <div>
            <form
            onSubmit={handleRegister}>
                {error && (
                    <div className="mb-4 p-3 border rounded-lg text-sm border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.1)] text-[#fca5a5]">
                        {error}
                    </div>
                )}

                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    fullWidth
                />

                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setPassword(e.target.value)
                        // Clear password error when user starts typing
                        if (passwordError) setPasswordError('')
                    }}
                    error={passwordError}
                    required
                    fullWidth
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setConfirmPassword(e.target.value)
                        // Clear password error when user starts typing
                        if (passwordError) setPasswordError('')
                        // Show error immediately if passwords don't match
                        if (e.target.value && e.target.value !== password) {
                            setPasswordError('Passwords do not match')
                        } else if (e.target.value && e.target.value === password) {
                            setPasswordError('')
                        }
                    }}
                    error={passwordError}
                    required
                    fullWidth
                    className="mb-4"
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    fullWidth
                >
                    Register
                </Button>

            </form>
        </div>
    )
}